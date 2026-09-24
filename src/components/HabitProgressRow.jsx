import { useState } from 'react'
import { Calendar, BarChart2, Flame } from 'lucide-react'
import { addDays, startOfDay, todayKey, habitDayStatus, WEEKDAY_LABELS } from '../game/dateUtils.js'
import { getIcon, colorClasses } from '../game/iconRegistry.js'
import HabitCalendarPopup from './HabitCalendarPopup.jsx'
import HabitStatsPopup from './HabitStatsPopup.jsx'

const DAY_CLASS = {
  done: 'bg-emerald-500 border-emerald-500 text-white',
  missed: 'bg-red-500 border-red-500 text-white',
  today: 'bg-amber-400 border-amber-400 text-bg',
  none: 'border-gray-700 text-gray-600',
}

function scheduleLabel(habit) {
  const s = habit.schedule
  if (!s || s.type === 'everyday') return 'Every day'
  if (s.type === 'weekdays') return `${(s.weekdays || []).length}x per week`
  return 'One-off'
}

export default function HabitProgressRow({ habit }) {
  const [showCalendar, setShowCalendar] = useState(false)
  const [showStats, setShowStats] = useState(false)

  const Icon = getIcon(habit.icon)
  const { text: iconColor, bg: iconBg } = colorClasses(habit.color)
  const today = startOfDay(new Date())
  const todayStr = todayKey()
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))

  const scheduled7 = last7.filter((d) => habitDayStatus(habit, d, todayStr) !== 'none')
  const done7 = last7.filter((d) => habitDayStatus(habit, d, todayStr) === 'done')
  const pct = scheduled7.length ? Math.round((done7.length / scheduled7.length) * 100) : 0

  return (
    <>
      <div className="bg-surface border border-border rounded-2xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
              <Icon size={16} className={iconColor} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{habit.title}</p>
              <p className="text-xs text-gray-500">{scheduleLabel(habit)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {last7.map((date) => {
            const status = habitDayStatus(habit, date, todayStr)
            return (
              <div key={date.toISOString()} className="flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-gray-500">{WEEKDAY_LABELS[date.getDay()]}</span>
                <span
                  className={`w-9 h-9 rounded-full border flex items-center justify-center text-xs font-semibold ${DAY_CLASS[status]}`}
                >
                  {date.getDate()}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-sm">
            {habit.currentStreak > 0 && (
              <span className="flex items-center gap-1 text-orange-400 font-medium">
                <Flame size={14} /> {habit.currentStreak}
              </span>
            )}
            <span className="font-semibold text-[var(--domain-accent)]">{pct}%</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCalendar(true)}
              aria-label="Open calendar"
              className="w-8 h-8 rounded-lg bg-surface-light text-gray-400 flex items-center justify-center hover:text-[var(--domain-accent)] transition-colors"
            >
              <Calendar size={15} />
            </button>
            <button
              onClick={() => setShowStats(true)}
              aria-label="Open statistics"
              className="w-8 h-8 rounded-lg bg-surface-light text-gray-400 flex items-center justify-center hover:text-[var(--domain-accent)] transition-colors"
            >
              <BarChart2 size={15} />
            </button>
          </div>
        </div>
      </div>

      {showCalendar && <HabitCalendarPopup habit={habit} onClose={() => setShowCalendar(false)} />}
      {showStats && <HabitStatsPopup habit={habit} onClose={() => setShowStats(false)} />}
    </>
  )
}