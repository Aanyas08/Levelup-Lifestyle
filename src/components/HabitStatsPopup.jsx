import { X } from 'lucide-react'
import { addDays, dateKey, habitDayStatus, startOfDay, todayKey } from '../game/dateUtils.js'

const DAYS = 30

function buildSeries(habit) {
  const today = startOfDay(new Date())
  const todayStr = todayKey()
  const days = Array.from({ length: DAYS }, (_, i) => addDays(today, i - (DAYS - 1)))

  return days.map((date) => {
    const status = habitDayStatus(habit, date, todayStr)
    if (status === 'none') return { key: dateKey(date), value: null }
    return { key: dateKey(date), value: status === 'done' ? 100 : status === 'today' ? null : 0 }
  })
}

function average(series) {
  const counted = series.filter((d) => d.value !== null)
  if (counted.length === 0) return 0
  return Math.round(counted.reduce((sum, d) => sum + d.value, 0) / counted.length)
}

export default function HabitStatsPopup({ habit, onClose }) {
  const series = buildSeries(habit)
  const last7 = series.slice(-7)
  const overallScore = average(series)
  const weeklyAvg = average(last7)

  const points = series.filter((d) => d.value !== null)
  const width = 280
  const height = 90
  const path = points.length
    ? points
        .map((d, i) => {
          const x = points.length === 1 ? width : (i / (points.length - 1)) * width
          const y = height - (d.value / 100) * height
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
        })
        .join(' ')
    : ''

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">Statistics</p>
            <h2 className="text-base font-semibold">{habit.title}</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-lg bg-surface-light text-gray-400 flex items-center justify-center hover:text-white transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <p className="text-xs text-gray-500 mb-2">Last 30 days</p>
        <div className="bg-surface-light rounded-xl p-3 mb-4">
          {path ? (
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-20" preserveAspectRatio="none">
              <path d={path} fill="none" stroke="var(--domain-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <p className="text-xs text-gray-500 text-center py-6">Not enough history yet.</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-surface-light rounded-xl py-3">
            <p className="text-lg font-bold text-[var(--domain-accent)]">{overallScore}%</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Score</p>
          </div>
          <div className="bg-surface-light rounded-xl py-3">
            <p className="text-lg font-bold text-[var(--domain-accent)]">{weeklyAvg}%</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Weekly avg</p>
          </div>
          <div className="bg-surface-light rounded-xl py-3">
            <p className="text-lg font-bold text-[var(--domain-accent)]">{habit.longestStreak}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">Best streak</p>
          </div>
        </div>
      </div>
    </div>
  )
}