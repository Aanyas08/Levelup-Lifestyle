import { useState } from 'react'
import { Pill, Check } from 'lucide-react'

function formatTime12(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 === 0 ? 12 : h % 12
  return `${h12}:${String(m).padStart(2, '0')} ${period}`
}

export default function TodaysMedicationCard({ events, loading, onMarkTaken }) {
  const [busyKey, setBusyKey] = useState(null)

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
        <p className="text-sm font-semibold mb-4">Medication</p>
        <div className="h-12 bg-surface-light rounded-xl animate-pulse" />
      </div>
    )
  }

  if (events.length === 0) return null // nothing to remind about — don't take up dashboard space

  async function markTaken(e) {
    const key = `${e.medication_id}-${e.scheduled_time}`
    setBusyKey(key)
    await onMarkTaken(e)
    setBusyKey(null)
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
      <p className="text-sm font-semibold mb-4">Medication</p>
      <div className="flex flex-col gap-2">
        {events.map((e) => {
          const key = `${e.medication_id}-${e.scheduled_time}`
          return (
            <div key={key} className="flex items-center gap-3 bg-surface-light rounded-xl px-3 py-2.5">
              <span className="w-8 h-8 rounded-lg bg-[var(--domain-accent)]/10 text-[var(--domain-accent)] flex items-center justify-center shrink-0">
                <Pill size={14} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{e.medication_name} <span className="text-gray-500 font-normal">· {e.dosage}</span></p>
                <p className="text-xs text-gray-500">{formatTime12(e.scheduled_time)}</p>
              </div>
              {e.status === 'taken' ? (
                <span className="text-xs font-medium text-[var(--domain-accent)] flex items-center gap-1 shrink-0">
                  <Check size={13} /> Taken
                </span>
              ) : (
                <button
                  onClick={() => markTaken(e)}
                  disabled={busyKey === key}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[var(--domain-accent)] text-bg hover:brightness-110 transition-all disabled:opacity-50 shrink-0"
                >
                  Mark taken
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}