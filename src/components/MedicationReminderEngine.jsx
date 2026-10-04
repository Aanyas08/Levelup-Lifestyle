import { useEffect, useRef } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'
import { medicationsApi } from '../api/client.js'

// How often to re-check the schedule, and how long after a dose's exact
// scheduled time a notification is still allowed to fire (so a 20s poll
// cadence doesn't mean a dose silently never gets notified).
const POLL_INTERVAL_MS = 20_000
const GRACE_WINDOW_MS = 2 * 60_000

const STORAGE_PREFIX = 'levelup:notified-doses'

// A small pill icon as an inline SVG data URI — no image asset needed,
// and it's self-contained so it always loads instantly. Shown as the
// notification's icon so it reads as a LevelUp notification at a glance
// instead of a generic bell.
const PILL_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E" +
  "%3Ccircle cx='32' cy='32' r='32' fill='%23a78bfa'/%3E" +
  "%3Crect x='14' y='28' width='36' height='16' rx='8' transform='rotate(-35 32 32)' fill='white'/%3E" +
  "%3Cline x1='32' y1='20' x2='32' y2='44' transform='rotate(-35 32 32)' stroke='%23a78bfa' stroke-width='3'/%3E" +
  "%3C/svg%3E"

function todayKeyLocal() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// Which doses have already triggered a notification today, so a dose is
// never notified twice (across poll cycles, tab refreshes, etc). Scoped
// per logged-in user — same lesson as the game-state bug: a fixed,
// unscoped key would let one account's "already notified" state bleed
// into another account on the same browser.
function loadNotifiedSet(userId) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${userId}`)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (parsed.date !== todayKeyLocal()) return new Set() // new day — start fresh
    return new Set(parsed.keys)
  } catch {
    return new Set()
  }
}

function saveNotifiedSet(userId, set) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}:${userId}`, JSON.stringify({ date: todayKeyLocal(), keys: [...set] }))
  } catch {
    // Storage unavailable — worst case a notification could repeat once;
    // not worth failing the feature over.
  }
}

async function showNotification({ title, body, tag, data }) {
  // Prefer the service worker path — it's the only way to get an
  // interactive "Mark as taken" button on the notification. Falls back
  // to a plain Notification (still gets the icon, just no action
  // buttons) if service workers aren't available for any reason —
  // same graceful-degradation approach used elsewhere in this app.
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready
      await registration.showNotification(title, {
        body,
        tag,
        data,
        icon: PILL_ICON,
        badge: PILL_ICON,
        requireInteraction: true, // stays visible until acted on, rather than auto-dismissing in a few seconds
        actions: [
          { action: 'taken', title: '✓ Mark as taken' },
          { action: 'dismiss', title: 'Dismiss' },
        ],
      })
      return
    } catch {
      // fall through to the plain Notification below
    }
  }

  if ('Notification' in window) {
    const notification = new Notification(title, { body, tag, icon: PILL_ICON })
    notification.onclick = () => window.focus()
  }
}

/**
 * Renders nothing. Mounted once inside the authenticated app shell, it
 * silently polls the logged-in user's own medication schedule and fires
 * a native desktop Notification (never an in-page popup) when a dose's
 * scheduled time arrives, provided:
 *   - Notification permission has already been granted (see
 *     NotificationPermissionBanner — this engine never prompts)
 *   - that specific medication has reminder_enabled
 *   - that specific dose hasn't been notified yet today
 *   - the dose isn't already taken/skipped
 *
 * Also registers the service worker (sw.js) that gives the notification
 * its "Mark as taken" action button, and listens for that action so
 * clicking it actually logs the dose without needing the app focused.
 */
export default function MedicationReminderEngine() {
  const { user } = useAuth()
  const notifiedRef = useRef(new Set())

  // Register the service worker once, regardless of login state — it's
  // inert until a notification actually needs it.
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registration can fail (e.g. not served over https/localhost) —
        // showNotification() falls back to plain Notification in that case.
      })
    }
  }, [])

  // Handle "Mark as taken" clicked from a notification's action button.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    function handleMessage(event) {
      if (event.data?.type !== 'MEDICATION_MARK_TAKEN') return
      const { medicationId, scheduledDate, scheduledTime } = event.data
      medicationsApi
        .logDose({
          medication_id: medicationId,
          scheduled_date: scheduledDate,
          scheduled_time: scheduledTime,
          status: 'taken',
        })
        .catch(() => {
          // Best-effort — if this fails, the dose just stays as-is and
          // the user can mark it from the Medications page instead.
        })
    }

    navigator.serviceWorker.addEventListener('message', handleMessage)
    return () => navigator.serviceWorker.removeEventListener('message', handleMessage)
  }, [])

  useEffect(() => {
    if (!user) {
      notifiedRef.current = new Set()
      return
    }

    notifiedRef.current = loadNotifiedSet(user.id)
    let cancelled = false

    async function check() {
      if (cancelled) return
      if (!('Notification' in window) || Notification.permission !== 'granted') return

      try {
        const [medsRes, todayRes] = await Promise.all([medicationsApi.list(), medicationsApi.today()])
        if (cancelled) return

        const reminderEnabled = new Map(medsRes.data.map((m) => [m.id, m.reminder_enabled]))
        const now = new Date()

        for (const event of todayRes.data) {
          if (event.status === 'taken' || event.status === 'skipped') continue
          if (!reminderEnabled.get(event.medication_id)) continue

          const key = `${event.medication_id}-${event.scheduled_date}-${event.scheduled_time}`
          if (notifiedRef.current.has(key)) continue

          const [h, m] = event.scheduled_time.split(':').map(Number)
          const scheduledAt = new Date(now)
          scheduledAt.setHours(h, m, 0, 0)
          const msSincePast = now - scheduledAt

          if (msSincePast >= 0 && msSincePast <= GRACE_WINDOW_MS) {
            await showNotification({
              title: '💊 Medication reminder',
              body: `${event.medication_name} — ${event.dosage} · ${event.scheduled_time}`,
              tag: key, // de-dupes at the OS level too if this somehow fires twice
              data: {
                medicationId: event.medication_id,
                scheduledDate: event.scheduled_date,
                scheduledTime: event.scheduled_time,
              },
            })

            notifiedRef.current.add(key)
            saveNotifiedSet(user.id, notifiedRef.current)
          }
        }
      } catch {
        // Best-effort — skip this cycle, the next poll will retry.
      }
    }

    check()
    const interval = setInterval(check, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [user?.id])

  return null
}