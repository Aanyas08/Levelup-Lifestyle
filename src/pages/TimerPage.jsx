// import { useEffect, useRef, useState } from 'react'
// import { Play, Pause, RotateCcw, Check, Timer as TimerIcon } from 'lucide-react'
// import { useGame } from '../game/GameContext.jsx'
// import DomainToggle from '../components/DomainToggle.jsx'
// import { getIcon } from '../game/iconRegistry.js'

// function formatClock(totalSeconds) {
//   const h = Math.floor(totalSeconds / 3600)
//   const m = Math.floor((totalSeconds % 3600) / 60)
//   const s = totalSeconds % 60
//   const pad = (n) => String(n).padStart(2, '0')
//   return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
// }

// export default function TimerPage() {
//   const { domainHabits, updateHabitTimer, activeDomain } = useGame()
//   const timerHabits = domainHabits.filter((h) => h.trackingType === 'timer')

//   const [elapsed, setElapsed] = useState(0)
//   const [running, setRunning] = useState(false)
//   const [selectedId, setSelectedId] = useState(null)
//   const [justLogged, setJustLogged] = useState(false)
//   const intervalRef = useRef(null)

//   useEffect(() => {
//     if (running) {
//       intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
//     }
//     return () => clearInterval(intervalRef.current)
//   }, [running])

//   // Default to the first available timer habit whenever the list changes
//   // (e.g. switching domains) and the current selection no longer applies.
//   useEffect(() => {
//     if (!timerHabits.some((h) => h.id === selectedId)) {
//       setSelectedId(timerHabits[0]?.id ?? null)
//     }
//   }, [timerHabits, selectedId])

//   const selectedHabit = timerHabits.find((h) => h.id === selectedId) || null

//   function reset() {
//     setRunning(false)
//     setElapsed(0)
//   }

//   function logToHabit() {
//     if (!selectedHabit || elapsed === 0) return
//     updateHabitTimer(selectedHabit.id, selectedHabit.timerElapsedSeconds + elapsed)
//     setRunning(false)
//     setElapsed(0)
//     setJustLogged(true)
//     setTimeout(() => setJustLogged(false), 2500)
//   }

//   return (
//     <div className="max-w-2xl">
//       <div className="flex items-center justify-between mb-1">
//         <h1 className="text-2xl font-bold">Timer</h1>
//         <DomainToggle compact />
//       </div>
//       <p className="text-gray-400 text-sm mb-6">
//         Run a session, then log the time straight into a {activeDomain === 'health' ? 'health' : 'lifestyle'} habit.
//       </p>

//       <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center mb-6">
//         <div className="w-44 h-44 rounded-full border-4 border-[var(--domain-accent)]/25 flex items-center justify-center relative mb-6">
//           <div
//             className={`absolute inset-0 rounded-full border-4 border-[var(--domain-accent)] transition-opacity ${
//               running ? 'opacity-100 animate-pulse' : 'opacity-0'
//             }`}
//           />
//           <span className="text-4xl font-bold tabular-nums">{formatClock(elapsed)}</span>
//         </div>

//         <div className="flex items-center gap-3">
//           <button
//             onClick={reset}
//             disabled={elapsed === 0 && !running}
//             aria-label="Reset"
//             className="w-11 h-11 rounded-full bg-surface-light text-gray-300 flex items-center justify-center hover:text-white transition-colors disabled:opacity-40"
//           >
//             <RotateCcw size={16} />
//           </button>
//           <button
//             onClick={() => setRunning((r) => !r)}
//             aria-label={running ? 'Pause' : 'Start'}
//             className="w-16 h-16 rounded-full bg-[var(--domain-accent)] text-bg flex items-center justify-center hover:brightness-110 hover:scale-105 active:scale-95 transition-all"
//           >
//             {running ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
//           </button>
//           <button
//             onClick={logToHabit}
//             disabled={!selectedHabit || elapsed === 0}
//             aria-label="Log to habit"
//             className="w-11 h-11 rounded-full bg-surface-light text-gray-300 flex items-center justify-center hover:text-[var(--domain-accent)] transition-colors disabled:opacity-40"
//           >
//             <Check size={16} />
//           </button>
//         </div>

//         {justLogged && (
//           <p className="text-xs text-[var(--domain-accent)] font-medium mt-4">Logged to {selectedHabit?.title}!</p>
//         )}
//       </div>

//       <div className="bg-surface border border-border rounded-2xl p-5">
//         <p className="text-sm font-medium text-gray-300 mb-4">Log this session to</p>

//         {timerHabits.length === 0 ? (
//           <p className="text-sm text-gray-500 text-center py-4">
//             No timer-tracked {activeDomain === 'health' ? 'health' : 'lifestyle'} habits yet. Create one from the
//             Habits page with tracking type "Timer" to log sessions here.
//           </p>
//         ) : (
//           <div className="flex flex-col gap-2">
//             {timerHabits.map((h) => {
//               const Icon = getIcon(h.icon)
//               const pct = Math.min(100, Math.round((h.timerElapsedSeconds / h.timerTargetSeconds) * 100))
//               const selected = h.id === selectedId
//               return (
//                 <button
//                   key={h.id}
//                   onClick={() => setSelectedId(h.id)}
//                   className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors ${
//                     selected
//                       ? 'border-[var(--domain-accent)] bg-[var(--domain-accent)]/10'
//                       : 'border-border hover:border-[var(--domain-accent)]/30'
//                   }`}
//                 >
//                   <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--domain-accent)] shrink-0">
//                     <Icon size={15} />
//                   </span>
//                   <span className="flex-1 min-w-0">
//                     <span className="text-sm font-medium block truncate">{h.title}</span>
//                     <span className="text-xs text-gray-500">
//                       {formatClock(h.timerElapsedSeconds)} / {formatClock(h.timerTargetSeconds)} today &middot; {pct}%
//                     </span>
//                   </span>
//                   {h.done && <TimerIcon size={14} className="text-[var(--domain-accent)] shrink-0" />}
//                 </button>
//               )
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }
import { useEffect, useRef, useState } from 'react'
import { Play, Pause, RotateCcw, Check, Timer as TimerIcon } from 'lucide-react'
import { useGame } from '../game/GameContext.jsx'
import DomainToggle from '../components/DomainToggle.jsx'
import { getIcon } from '../game/iconRegistry.js'

function formatClock(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const pad = (n) => String(n).padStart(2, '0')
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

const WHEEL_ITEM_HEIGHT = 36

// A single scrollable "wheel" column (used for hours / minutes / seconds).
// It's a plain scroll-snap list rather than a native <select> so three of
// them can sit side by side and read like a countdown-timer picker.
function TimeWheel({ max, value, onChange, label }) {
  const containerRef = useRef(null)
  const scrollTimeout = useRef(null)
  const items = Array.from({ length: max }, (_, i) => i)

  useEffect(() => {
    const el = containerRef.current
    if (el) el.scrollTop = value * WHEEL_ITEM_HEIGHT
    // Only snap to the initial value on mount — user-driven scrolling
    // after that is handled by handleScroll below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleScroll() {
    clearTimeout(scrollTimeout.current)
    scrollTimeout.current = setTimeout(() => {
      const el = containerRef.current
      if (!el) return
      const index = Math.max(0, Math.min(max - 1, Math.round(el.scrollTop / WHEEL_ITEM_HEIGHT)))
      el.scrollTo({ top: index * WHEEL_ITEM_HEIGHT, behavior: 'smooth' })
      if (index !== value) onChange(index)
    }, 120)
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-9 border-y border-[var(--domain-accent)]/40 pointer-events-none" />
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="h-[108px] w-16 overflow-y-scroll snap-y snap-mandatory no-scrollbar"
        >
          <div style={{ height: WHEEL_ITEM_HEIGHT }} />
          {items.map((i) => (
            <div
              key={i}
              className={`h-9 flex items-center justify-center snap-center text-lg tabular-nums transition-colors ${
                i === value ? 'text-white font-bold' : 'text-gray-600'
              }`}
            >
              {String(i).padStart(2, '0')}
            </div>
          ))}
          <div style={{ height: WHEEL_ITEM_HEIGHT }} />
        </div>
      </div>
      <span className="text-[10px] text-gray-500 mt-1">{label}</span>
    </div>
  )
}

function ModeTabs({ mode, setMode, disabled }) {
  return (
    <div className="flex bg-surface-light rounded-lg p-1 mb-6">
      {['stopwatch', 'countdown'].map((m) => (
        <button
          key={m}
          onClick={() => !disabled && setMode(m)}
          disabled={disabled}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold capitalize transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
            mode === m ? 'bg-[var(--domain-accent)] text-bg' : 'text-gray-400 hover:text-white'
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

export default function TimerPage() {
  const { domainHabits, updateHabitTimer, activeDomain } = useGame()
  const timerHabits = domainHabits.filter((h) => h.trackingType === 'timer')

  const [mode, setMode] = useState('stopwatch')
  const [running, setRunning] = useState(false)

  // Stopwatch state — counts up from 0.
  const [elapsed, setElapsed] = useState(0)

  // Countdown state — h/m/s wheel selection before starting, then
  // `remaining` counts down once started (null = not started yet, so the
  // wheels are shown instead of the countdown display).
  const [pickH, setPickH] = useState(0)
  const [pickM, setPickM] = useState(10)
  const [pickS, setPickS] = useState(0)
  const [remaining, setRemaining] = useState(null)
  const countdownTotal = pickH * 3600 + pickM * 60 + pickS

  const [selectedId, setSelectedId] = useState(null)
  const [justLogged, setJustLogged] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      if (mode === 'stopwatch') {
        setElapsed((e) => e + 1)
      } else {
        setRemaining((r) => {
          if (r === null) return r
          if (r <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            return 0
          }
          return r - 1
        })
      }
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [running, mode])

  // Default to the first available timer habit whenever the list changes
  // (e.g. switching domains) and the current selection no longer applies.
  useEffect(() => {
    if (!timerHabits.some((h) => h.id === selectedId)) {
      setSelectedId(timerHabits[0]?.id ?? null)
    }
  }, [timerHabits, selectedId])

  const selectedHabit = timerHabits.find((h) => h.id === selectedId) || null

  function switchMode(next) {
    clearInterval(intervalRef.current)
    setRunning(false)
    setElapsed(0)
    setRemaining(null)
    setMode(next)
  }

  function startCountdown() {
    if (countdownTotal === 0) return
    setRemaining(countdownTotal)
    setRunning(true)
  }

  function reset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    if (mode === 'stopwatch') setElapsed(0)
    else setRemaining(null) // back to the wheel pickers
  }

  // Seconds actually spent this session, regardless of mode.
  const sessionSeconds = mode === 'stopwatch' ? elapsed : remaining === null ? 0 : countdownTotal - remaining

  function logToHabit() {
    if (!selectedHabit || sessionSeconds === 0) return
    updateHabitTimer(selectedHabit.id, selectedHabit.timerElapsedSeconds + sessionSeconds)
    clearInterval(intervalRef.current)
    setRunning(false)
    if (mode === 'stopwatch') setElapsed(0)
    else setRemaining(null)
    setJustLogged(true)
    setTimeout(() => setJustLogged(false), 2500)
  }

  const showingWheels = mode === 'countdown' && remaining === null
  const displaySeconds = mode === 'stopwatch' ? elapsed : remaining ?? countdownTotal
  const countdownDone = mode === 'countdown' && remaining === 0

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Timer</h1>
        <DomainToggle compact />
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Run a session, then log the time straight into a {activeDomain === 'health' ? 'health' : 'lifestyle'} habit.
      </p>

      <div className="bg-surface border border-border rounded-2xl p-8 flex flex-col items-center mb-6">
        <ModeTabs mode={mode} setMode={switchMode} disabled={running || (mode === 'countdown' && remaining > 0)} />

        {showingWheels ? (
          <div className="flex items-start gap-3 mb-6">
            <TimeWheel max={4} value={pickH} onChange={setPickH} label="hr" />
            <span className="text-2xl text-gray-600 mt-8">:</span>
            <TimeWheel max={60} value={pickM} onChange={setPickM} label="min" />
            <span className="text-2xl text-gray-600 mt-8">:</span>
            <TimeWheel max={60} value={pickS} onChange={setPickS} label="sec" />
          </div>
        ) : (
          <div className="w-44 h-44 rounded-full border-4 border-[var(--domain-accent)]/25 flex items-center justify-center relative mb-6">
            <div
              className={`absolute inset-0 rounded-full border-4 border-[var(--domain-accent)] transition-opacity ${
                running ? 'opacity-100 animate-pulse' : 'opacity-0'
              }`}
            />
            <span className={`text-4xl font-bold tabular-nums ${countdownDone ? 'text-[var(--domain-accent)]' : ''}`}>
              {formatClock(displaySeconds)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={reset}
            disabled={showingWheels || (sessionSeconds === 0 && !running)}
            aria-label="Reset"
            className="w-11 h-11 rounded-full bg-surface-light text-gray-300 flex items-center justify-center hover:text-white transition-colors disabled:opacity-40"
          >
            <RotateCcw size={16} />
          </button>

          {showingWheels ? (
            <button
              onClick={startCountdown}
              disabled={countdownTotal === 0}
              aria-label="Start countdown"
              className="w-16 h-16 rounded-full bg-[var(--domain-accent)] text-bg flex items-center justify-center hover:brightness-110 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
            >
              <Play size={22} className="ml-0.5" />
            </button>
          ) : (
            <button
              onClick={() => setRunning((r) => !r)}
              disabled={countdownDone}
              aria-label={running ? 'Pause' : 'Start'}
              className="w-16 h-16 rounded-full bg-[var(--domain-accent)] text-bg flex items-center justify-center hover:brightness-110 hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
            >
              {running ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
            </button>
          )}

          <button
            onClick={logToHabit}
            disabled={!selectedHabit || sessionSeconds === 0}
            aria-label="Log to habit"
            className="w-11 h-11 rounded-full bg-surface-light text-gray-300 flex items-center justify-center hover:text-[var(--domain-accent)] transition-colors disabled:opacity-40"
          >
            <Check size={16} />
          </button>
        </div>

        {countdownDone && !justLogged && (
          <p className="text-xs text-[var(--domain-accent)] font-medium mt-4">Time's up — log it to a habit below.</p>
        )}
        {justLogged && (
          <p className="text-xs text-[var(--domain-accent)] font-medium mt-4">Logged to {selectedHabit?.title}!</p>
        )}
      </div>

      <div className="bg-surface border border-border rounded-2xl p-5">
        <p className="text-sm font-medium text-gray-300 mb-4">Log this session to</p>

        {timerHabits.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            No timer-tracked {activeDomain === 'health' ? 'health' : 'lifestyle'} habits yet. Create one from the
            Habits page with tracking type "Timer" to log sessions here.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {timerHabits.map((h) => {
              const Icon = getIcon(h.icon)
              const pct = Math.min(100, Math.round((h.timerElapsedSeconds / h.timerTargetSeconds) * 100))
              const selected = h.id === selectedId
              return (
                <button
                  key={h.id}
                  onClick={() => setSelectedId(h.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-colors ${
                    selected
                      ? 'border-[var(--domain-accent)] bg-[var(--domain-accent)]/10'
                      : 'border-border hover:border-[var(--domain-accent)]/30'
                  }`}
                >
                  <span className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[var(--domain-accent)] shrink-0">
                    <Icon size={15} />
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{h.title}</span>
                    <span className="text-xs text-gray-500">
                      {formatClock(h.timerElapsedSeconds)} / {formatClock(h.timerTargetSeconds)} today &middot; {pct}%
                    </span>
                  </span>
                  {h.done && <TimerIcon size={14} className="text-[var(--domain-accent)] shrink-0" />}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}