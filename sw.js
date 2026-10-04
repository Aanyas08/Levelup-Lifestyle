// Minimal service worker. Its only job is letting medication-reminder
// notifications show interactive action buttons — a plain `new
// Notification()` doesn't support actions in most browsers, but
// `registration.showNotification()` via a service worker does. No
// caching, no offline support, no push subscription here on purpose;
// this project doesn't need a full PWA worker for this feature.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('notificationclick', (event) => {
  const { action, notification } = event
  const data = notification.data || {}
  notification.close()

  if (action === 'dismiss') return // just closes, nothing else to do

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })

      if (action === 'taken') {
        if (allClients.length > 0) {
          allClients[0].postMessage({ type: 'MEDICATION_MARK_TAKEN', ...data })
          allClients[0].focus()
        }
        // If no LevelUp tab is open at all, there's nothing to tell the
        // app — the dose stays as-is and the user can mark it from the
        // Medications page next time they open it.
        return
      }

      // A click on the notification body itself (not an action button) —
      // just bring the app to the front, open it if it's not running.
      if (allClients.length > 0) {
        allClients[0].focus()
      } else if (self.clients.openWindow) {
        self.clients.openWindow('/medications')
      }
    })()
  )
})