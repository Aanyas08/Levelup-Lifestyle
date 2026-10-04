import { useState } from 'react'
import { Bell, X } from 'lucide-react'

// Requesting Notification permission must happen from a real user click
// for browsers to reliably show the native prompt — this banner exists
// only to provide that click. It renders nothing once permission has
// already been decided (granted or denied) or the user dismisses it.
export default function NotificationPermissionBanner() {
  const supported = typeof window !== 'undefined' && 'Notification' in window
  const [permission, setPermission] = useState(supported ? Notification.permission : 'denied')
  const [dismissed, setDismissed] = useState(false)

  if (!supported || permission !== 'default' || dismissed) return null

  async function handleEnable() {
    try {
      const result = await Notification.requestPermission()
      setPermission(result)
    } catch {
      setPermission(Notification.permission)
    }
  }

  return (
    <div className="flex items-center gap-3 bg-[var(--domain-accent)]/10 border border-[var(--domain-accent)]/25 rounded-2xl px-4 py-3 mb-6">
      <Bell size={16} className="text-[var(--domain-accent)] shrink-0" />
      <p className="text-sm text-gray-300 flex-1">
        Turn on desktop notifications to get reminded at each medicine's scheduled time.
      </p>
      <button
        onClick={handleEnable}
        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--domain-accent)] text-bg hover:brightness-110 transition-all shrink-0"
      >
        Enable reminders
      </button>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="text-gray-500 hover:text-white transition-colors shrink-0"
      >
        <X size={15} />
      </button>
    </div>
  )
}