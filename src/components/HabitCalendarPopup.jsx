import { useState } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { getMonthGrid, dateKey, todayKey, formatMonthYear, habitDayStatus } from '../game/dateUtils.js'

const DOT_CLASS = {
  done: 'bg-emerald-500 text-white',
  missed: 'bg-red-500 text-white',
  today: 'bg-amber-400 text-bg',
  none: 'text-gray-600',
}

export default function HabitCalendarPopup({ habit, onClose }) {
  const [cursor, setCursor] = useState(new Date())
  const today = todayKey()
  const cells = getMonthGrid(cursor.getFullYear(), cursor.getMonth())

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-surface border border-border rounded-2xl w-full max-w-sm p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500">Calendar</p>
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

        <div className="flex items-center justify-between mb-3">
          <button
            aria-label="Previous month"
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="text-sm font-semibold">{formatMonthYear(cursor)}</span>
          <button
            aria-label="Next month"
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="w-7 h-7 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <ChevronRight size={15} />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-y-2 text-center mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <span key={d} className="text-[10px] font-medium text-gray-500">{d}</span>
          ))}
          {cells.map(({ date, inMonth }) => {
            const key = dateKey(date)
            const status = inMonth ? habitDayStatus(habit, date, today) : 'none'
            return (
              <div key={key} className="flex items-center justify-center">
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    inMonth ? DOT_CLASS[status] : 'text-gray-700'
                  }`}
                >
                  {date.getDate()}
                </span>
              </div>
            )
          })}
        </div>

        <div className="flex items-center justify-center gap-4 text-[11px] text-gray-500 mb-4">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Done</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" />Today</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Missed</span>
        </div>

        <div className="text-center pt-4 border-t border-border">
          <p className="text-xs text-gray-500 mb-1">Streak</p>
          <p className="text-2xl font-bold text-[var(--domain-accent)]">{habit.currentStreak} days</p>
        </div>
      </div>
    </div>
  )
}