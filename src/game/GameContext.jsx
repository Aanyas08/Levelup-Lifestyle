import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useAuth } from '../auth/AuthContext.jsx'
import { gameApi } from '../api/client.js'
import { xpForLevel, rankForLevel, DIFFICULTY_REWARDS } from './xpCurve.js'
import { initialHabits, initialPlayer } from './initialData.js'
import { todayKey, isScheduledOn, getWeekDates, dateKey, habitExistedOn, addDays, startOfDay } from './dateUtils.js'

const GameContext = createContext(null)

// How long to wait after the last change before pushing state to the
// backend. Habit updates (ticking a box, nudging a timer) can fire in
// quick bursts, so this collapses a burst into a single PUT /game/state
// rather than one request per keystroke/tick.
const SAVE_DEBOUNCE_MS = 1200

export function GameProvider({ children }) {
  const { isAuthenticated, checkingSession } = useAuth()

  const [player, setPlayer] = useLocalStorage('levelup:player', initialPlayer)
  const [habits, setHabits] = useLocalStorage('levelup:habits', initialHabits)
  // 'health' | 'lifestyle' — which side of the app is currently active.
  // Drives both the theme accent color and which habits/dashboard show.
  const [activeDomain, setActiveDomain] = useLocalStorage('levelup:domain', 'lifestyle')
  // Transient — not persisted. Holds level-up info while the celebration
  // modal is showing, then gets cleared.
  const [levelUpEvent, setLevelUpEvent] = useState(null)

  // Whether we've finished pulling this account's saved state from the
  // backend yet. Gates autosave below — without this, the very first
  // render (still holding whatever was last in localStorage, possibly
  // from a different account on a shared browser) would immediately get
  // pushed to the server and clobber that account's real saved state
  // before the fetch below even has a chance to run.
  const hasLoadedRemoteRef = useRef(false)

  // Pull this account's saved game state on login, and reset the gate
  // on logout so the next login re-fetches instead of reusing stale data.
  useEffect(() => {
    if (checkingSession) return

    if (!isAuthenticated) {
      hasLoadedRemoteRef.current = false
      return
    }

    let cancelled = false
    gameApi
      .getState()
      .then((res) => {
        if (cancelled) return
        const remote = res.data?.state
        if (remote) {
          if (remote.player) setPlayer(remote.player)
          if (remote.habits) setHabits(remote.habits)
          if (remote.activeDomain) setActiveDomain(remote.activeDomain)
        }
        // No remote state yet (brand-new account) still counts as
        // "loaded" — it just means autosave starts from whatever's
        // currently in local state instead of overwriting it.
        hasLoadedRemoteRef.current = true
      })
      .catch(() => {
        // Couldn't reach the backend — don't block the app on it, but
        // also don't start autosaving over a state we never actually
        // confirmed is this account's, so a transient network error
        // can't silently push stale/wrong data to the server once it's
        // back.
        hasLoadedRemoteRef.current = false
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, checkingSession, setPlayer, setHabits, setActiveDomain])

  // Push changes to the backend, debounced, once the initial load above
  // has completed. This is what makes progress durable per-account
  // instead of living only in this browser's localStorage.
  useEffect(() => {
    if (!isAuthenticated || !hasLoadedRemoteRef.current) return

    const timeout = setTimeout(() => {
      gameApi.saveState({ player, habits, activeDomain }).catch(() => {
        // Best-effort — a failed save here isn't shown to the user since
        // it would fire constantly on flaky connections; local state and
        // localStorage remain the source of truth for the current
        // session regardless, so nothing is lost, just not yet synced.
      })
    }, SAVE_DEBOUNCE_MS)

    return () => clearTimeout(timeout)
  }, [player, habits, activeDomain, isAuthenticated])

  // Reflect the active domain on <html> so index.css can theme the whole
  // app (accent color, soft backgrounds) with a CSS transition.
  useEffect(() => {
    document.documentElement.setAttribute('data-domain', activeDomain)
  }, [activeDomain])

  const toggleDomain = useCallback(() => {
    setActiveDomain((d) => (d === 'health' ? 'lifestyle' : 'health'))
  }, [setActiveDomain])

  /**
   * Daily rollover. Runs once on mount (and again if the tab stays open
   * past midnight — checked every 60s).
   */
  useEffect(() => {
    function rollover() {
      const today = todayKey()
      setPlayer((prevPlayer) => {
        if (prevPlayer.lastSeenDate === today) return prevPlayer

        setHabits((prevHabits) =>
          prevHabits.map((h) => {
            if (h.done) {
              return { ...h, done: false, timerElapsedSeconds: 0, numericValue: 0 }
            }
            const lastSeen = prevPlayer.lastSeenDate
            const wasScheduled =
              lastSeen && isScheduledOn(h, new Date(lastSeen)) && habitExistedOn(h, new Date(lastSeen))
            const history = wasScheduled && lastSeen && !(lastSeen in (h.history || {}))
              ? { ...h.history, [lastSeen]: false }
              : h.history
            return { ...h, history, done: false, timerElapsedSeconds: 0, numericValue: 0 }
          })
        )

        return { ...prevPlayer, lastSeenDate: today }
      })
    }

    rollover()
    const interval = setInterval(rollover, 60_000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * Shared completion engine. Every tracking type (tick / timer / numeric)
   * eventually funnels through here so XP, coins, streaks, and level-ups
   * stay consistent regardless of how "done" was triggered, and regardless
   * of which domain (health / lifestyle) the habit belongs to — XP and
   * level are shared, game-wide progress.
   */
  const applyDoneChange = useCallback(
    (id, nowDone) => {
      setHabits((prevHabits) => {
        const habit = prevHabits.find((h) => h.id === id)
        if (!habit || habit.done === nowDone) return prevHabits

        setPlayer((prevPlayer) => {
          const xpDelta = nowDone ? habit.xp : -habit.xp
          const coinDelta = nowDone ? habit.coins : -habit.coins

          let xp = prevPlayer.xp + xpDelta
          let level = prevPlayer.level
          let leveledUpTo = null
          let bonusCoins = 0

          if (xpDelta > 0) {
            let required = xpForLevel(level)
            while (xp >= required) {
              xp -= required
              level += 1
              bonusCoins += 50
              leveledUpTo = level
              required = xpForLevel(level)
            }
          }
          if (xp < 0) xp = 0

          const totalXpEarned = Math.max(0, prevPlayer.totalXpEarned + xpDelta)
          const coins = Math.max(0, prevPlayer.coins + coinDelta + bonusCoins)

          if (leveledUpTo) {
            setLevelUpEvent({ level: leveledUpTo, bonusCoins, rank: rankForLevel(leveledUpTo) })
          }

          return { ...prevPlayer, xp, level, totalXpEarned, coins }
        })

        const today = todayKey()
        return prevHabits.map((h) =>
          h.id === id
            ? {
                ...h,
                done: nowDone,
                history: { ...h.history, [today]: nowDone },
                totalCompletions: h.totalCompletions + (nowDone ? 1 : -1),
                currentStreak: nowDone ? h.currentStreak + 1 : Math.max(0, h.currentStreak - 1),
                longestStreak: nowDone
                  ? Math.max(h.longestStreak, h.currentStreak + 1)
                  : h.longestStreak,
              }
            : h
        )
      })
    },
    [setHabits, setPlayer]
  )

  const toggleHabit = useCallback(
    (id) => {
      const habit = habits.find((h) => h.id === id)
      if (!habit) return
      applyDoneChange(id, !habit.done)
    },
    [habits, applyDoneChange]
  )

  const updateHabitTimer = useCallback(
    (id, elapsedSeconds) => {
      const habit = habits.find((h) => h.id === id)
      if (!habit) return
      const clamped = Math.max(0, Math.min(elapsedSeconds, habit.timerTargetSeconds))

      setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, timerElapsedSeconds: clamped } : h)))

      const nowDone = clamped >= habit.timerTargetSeconds
      if (nowDone !== habit.done) applyDoneChange(id, nowDone)
    },
    [habits, setHabits, applyDoneChange]
  )

  const updateHabitNumeric = useCallback(
    (id, value) => {
      const habit = habits.find((h) => h.id === id)
      if (!habit) return
      const clamped = Math.max(0, value)

      setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, numericValue: clamped } : h)))

      const nowDone = clamped >= habit.numericTarget
      if (nowDone !== habit.done) applyDoneChange(id, nowDone)
    },
    [habits, setHabits, applyDoneChange]
  )

  const addHabit = useCallback(
    ({
      title,
      description = '',
      domain = activeDomain,
      category = 'Discipline',
      difficulty = 'Medium',
      frequency = 'Daily',
      timeEstimate = '10 min',
      icon = 'Sparkles',
      color = 'teal',
      kind = 'habit',
      trackingType = 'tick',
      timerTargetSeconds = 600,
      numericTarget = 10,
      numericUnit = 'reps',
      schedule = null,
    }) => {
      const rewards = DIFFICULTY_REWARDS[difficulty] || DIFFICULTY_REWARDS.Medium
      const resolvedSchedule =
        schedule || (kind === 'task' ? { type: 'date', date: todayKey() } : { type: 'everyday' })

      setHabits((prev) => [
        ...prev,
        {
          id: Date.now(),
          title,
          description,
          domain,
          category,
          difficulty,
          frequency: kind === 'task' ? 'Once' : frequency,
          timeEstimate,
          icon,
          color,
          kind,
          trackingType,
          timerTargetSeconds,
          timerElapsedSeconds: 0,
          numericTarget,
          numericUnit,
          numericValue: 0,
          done: false,
          currentStreak: 0,
          longestStreak: 0,
          totalCompletions: 0,
          schedule: resolvedSchedule,
          history: {},
          createdAt: Date.now(),
          ...rewards,
        },
      ])
    },
    [setHabits, activeDomain]
  )

  const removeHabit = useCallback(
    (id) => {
      setHabits((prev) => prev.filter((h) => h.id !== id))
    },
    [setHabits]
  )

  const clearLevelUpEvent = useCallback(() => setLevelUpEvent(null), [])

  // Habits belonging to the currently active domain (health / lifestyle).
  const domainHabits = useMemo(
    () => habits.filter((h) => (h.domain || 'lifestyle') === activeDomain),
    [habits, activeDomain]
  )

  // Habits scheduled for today, within the active domain — used on the
  // Dashboard so "today's habits" reflects both the schedule and the
  // currently selected domain.
  const todaysHabits = useMemo(() => {
    const now = new Date()
    return domainHabits.filter((h) => habitExistedOn(h, now) && isScheduledOn(h, now))
  }, [domainHabits])

  // Sun-Sat completion for the current week, within the active domain.
  const weeklyProgress = useMemo(() => {
    const week = getWeekDates(new Date())
    const today = new Date()
    return week.map((date) => {
      const key = dateKey(date)
      const scheduledHabits = domainHabits.filter((h) => habitExistedOn(h, date) && isScheduledOn(h, date))
      if (scheduledHabits.length === 0) return { date, key, status: 'none', pct: 0 }
      if (date > today) return { date, key, status: 'future', pct: 0 }

      const doneCount = scheduledHabits.filter((h) => h.history?.[key] === true).length
      const pct = Math.round((doneCount / scheduledHabits.length) * 100)
      const allRecorded = scheduledHabits.every((h) => key in (h.history || {}))
      let status
      if (pct === 100) status = 'done'
      else if (dateKey(date) === dateKey(today)) status = 'today'
      else if (allRecorded || date < today) status = pct > 0 ? 'partial' : 'missed'
      else status = 'partial'
      return { date, key, status, pct, doneCount, totalCount: scheduledHabits.length }
    })
  }, [domainHabits])

  // Health-domain habits grouped by category, each with today's progress —
  // this is what powers the wellness dashboard widget grid. Built purely
  // from whatever health habits actually exist, so it adapts to the data
  // rather than assuming a fixed Sleep/Hydration/Energy set.
  const healthCategories = useMemo(() => {
    const healthHabits = habits.filter((h) => (h.domain || 'lifestyle') === 'health')
    const now = new Date()
    const groups = {}
    for (const h of healthHabits) {
      if (!habitExistedOn(h, now)) continue
      const key = h.category || 'Other'
      if (!groups[key]) groups[key] = []
      groups[key].push(h)
    }
    return Object.entries(groups).map(([category, items]) => {
      const scheduledToday = items.filter((h) => isScheduledOn(h, now))
      const basis = scheduledToday.length ? scheduledToday : items
      const totalPct =
        basis.reduce((sum, h) => {
          if (h.trackingType === 'numeric') return sum + Math.min(100, Math.round((h.numericValue / h.numericTarget) * 100))
          if (h.trackingType === 'timer') return sum + Math.min(100, Math.round((h.timerElapsedSeconds / h.timerTargetSeconds) * 100))
          return sum + (h.done ? 100 : 0)
        }, 0) / basis.length
      return { category, habits: items, pct: Math.round(totalPct || 0) }
    })
  }, [habits])

  // Category breakdown for whichever domain is currently active — same
  // shape as healthCategories, but works for Lifestyle too, so the
  // Progress page can show a "Sleep / Hydration / ..."-style bar list
  // regardless of which side of the app you're on.
  const domainCategories = useMemo(() => {
    const now = new Date()
    const groups = {}
    for (const h of domainHabits) {
      if (!habitExistedOn(h, now)) continue
      const key = h.category || 'Other'
      if (!groups[key]) groups[key] = []
      groups[key].push(h)
    }
    return Object.entries(groups).map(([category, items]) => {
      const scheduledToday = items.filter((h) => isScheduledOn(h, now))
      const basis = scheduledToday.length ? scheduledToday : items
      const totalPct =
        basis.reduce((sum, h) => {
          if (h.trackingType === 'numeric') return sum + Math.min(100, Math.round((h.numericValue / h.numericTarget) * 100))
          if (h.trackingType === 'timer') return sum + Math.min(100, Math.round((h.timerElapsedSeconds / h.timerTargetSeconds) * 100))
          return sum + (h.done ? 100 : 0)
        }, 0) / basis.length
      return { category, habits: items, pct: Math.round(totalPct || 0) }
    })
  }, [domainHabits])

  // Daily completion % for the last 14 days, within the active domain —
  // feeds the sparkline trend cards on the Progress page.
  const progressTrend = useMemo(() => {
    const today = startOfDay(new Date())
    const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13))
    return days.map((date) => {
      const key = dateKey(date)
      const scheduled = domainHabits.filter((h) => habitExistedOn(h, date) && isScheduledOn(h, date))
      if (scheduled.length === 0) return { key, date, pct: null }
      const done = scheduled.filter((h) => h.history?.[key] === true).length
      return { key, date, pct: Math.round((done / scheduled.length) * 100) }
    })
  }, [domainHabits])

  const derived = useMemo(() => {
    const xpCap = xpForLevel(player.level)
    const doneCount = todaysHabits.filter((h) => h.done).length
    const totalCount = todaysHabits.length
    const dailyCompletionPct = totalCount ? Math.round((doneCount / totalCount) * 100) : 0
    return {
      xpCap,
      doneCount,
      totalCount,
      dailyCompletionPct,
      rank: rankForLevel(player.level),
    }
  }, [player.level, todaysHabits])

  const value = useMemo(
    () => ({
      player,
      habits,
      activeDomain,
      setActiveDomain,
      toggleDomain,
      domainHabits,
      todaysHabits,
      weeklyProgress,
      healthCategories,
      domainCategories,
      progressTrend,
      ...derived,
      toggleHabit,
      updateHabitTimer,
      updateHabitNumeric,
      addHabit,
      removeHabit,
      levelUpEvent,
      clearLevelUpEvent,
    }),
    [
      player,
      habits,
      activeDomain,
      setActiveDomain,
      toggleDomain,
      domainHabits,
      todaysHabits,
      weeklyProgress,
      healthCategories,
      domainCategories,
      progressTrend,
      derived,
      toggleHabit,
      updateHabitTimer,
      updateHabitNumeric,
      addHabit,
      removeHabit,
      levelUpEvent,
      clearLevelUpEvent,
    ]
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within a GameProvider')
  return ctx
}
