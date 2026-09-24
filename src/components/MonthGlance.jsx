import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getMonthGrid,
  dateKey,
  todayKey,
  formatMonthYear,
  isScheduledOn,
  habitExistedOn,
  WEEKDAY_LABELS,
} from '../game/dateUtils.js'

/**
 * Small month calendar for the Health dashboard — each day is dotted
 * green (fully done), amber (partially done), or left plain (nothing
 * scheduled / in the future), based on every health habit's history.
 * This is the "calendar-based scheduling" view from the pitch deck,
 * scaled down to sit alongside the category cards rather than take
 * over the page.
 */
export default function MonthGlance({ habits }) {
  const [cursor, setCursor] = useState(new Date())
  const today = todayKey()

  const cells = useMemo(() => {
    const grid = getMonthGrid(cursor.getFullYear(), cursor.getMonth())
    return grid.map(({ date, inMonth }) => {
      const key = dateKey(date)
      const scheduled = habits.filter((h) => habitExistedOn(h, date) && isScheduledOn(h, date))
      const done = scheduled.filter((h) => h.history?.[key] === true).length
      let status = 'none'
      if (scheduled.length > 0 && key <= today) {
        if (done === scheduled.length) status = 'done'
        else if (done > 0) status = 'partial'
        else status = key < today ? 'missed' : 'none'
      }
      return { key, date, inMonth, status, isToday: key === today }
    })
  }, [cursor, habits, today])

  const dotClass = {
    done: 'bg-[var(--domain-accent)]',
    partial: 'bg-[var(--domain-accent)]/40',
    missed: 'bg-red-400/60',
    none: '',
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold">{formatMonthYear(cursor)}</span>
        <div className="flex gap-1">
          <button
            aria-label="Previous month"
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            aria-label="Next month"
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
            className="w-6 h-6 rounded-md flex items-center justify-center text-gray-400 hover:text-white hover:bg-surface-light transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-2 text-center">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="text-[10px] font-medium text-gray-500">{label[0]}</span>
        ))}
        {cells.map(({ key, date, inMonth, status, isToday }) => (
          <div key={key} className="flex flex-col items-center gap-1">
            <span
              className={`text-xs w-6 h-6 rounded-full flex items-center justify-center ${
                !inMonth ? 'text-gray-700' : isToday ? 'bg-[var(--domain-accent)] text-bg font-semibold' : 'text-gray-300'
              }`}
            >
              {date.getDate()}
            </span>
            <span className={`w-1 h-1 rounded-full ${inMonth ? dotClass[status] : ''}`} />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--domain-accent)]" />All done</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--domain-accent)]/40" />Partial</span>
        <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-red-400/60" />Missed</span>
      </div>
    </div>
  )
}
