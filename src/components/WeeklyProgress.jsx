import { Check, X, Minus } from 'lucide-react'

const STATUS_STYLES = {
  done: 'bg-[var(--domain-accent)] text-bg',
  missed: 'bg-red-500/15 text-red-400',
  partial: 'bg-[var(--domain-accent)]/20 text-[var(--domain-accent)]',
  today: 'border-2 border-[var(--domain-accent)] text-[var(--domain-accent)]',
  future: 'bg-surface-light text-gray-600',
  none: 'bg-surface-light text-gray-600',
}

function StatusIcon({ status }) {
  if (status === 'done') return <Check size={13} strokeWidth={3} />
  if (status === 'missed') return <X size={13} strokeWidth={3} />
  return <Minus size={12} />
}

export default function WeeklyProgress({ weeklyProgress }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
      <p className="text-sm font-medium text-gray-300 mb-4">This week</p>
      <div className="flex justify-between gap-2">
        {weeklyProgress.map((day) => {
          const label = day.date.toLocaleDateString(undefined, { weekday: 'short' })[0]
          const dayNum = day.date.getDate()
          return (
            <div key={day.key} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-[10px] text-gray-500">{label}</span>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${STATUS_STYLES[day.status]}`}
                title={`${day.pct}% complete`}
              >
                <StatusIcon status={day.status} />
              </div>
              <span className="text-[10px] text-gray-600">{dayNum}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
