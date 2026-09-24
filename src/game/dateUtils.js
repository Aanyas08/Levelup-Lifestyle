// Central date helpers for scheduling, history keys, and calendar grids.
// A "date key" is always a local YYYY-MM-DD string — used as the object key
// for per-day history so it's stable, sortable, and human-readable in
// localStorage/devtools.

export const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
export const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function dateKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayKey() {
  return dateKey(new Date())
}

export function keyToDate(key) {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function isSameDay(a, b) {
  return dateKey(a) === dateKey(b)
}

export function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date, delta) {
  const d = new Date(date)
  d.setDate(d.getDate() + delta)
  return d
}

export function addMonths(date, delta) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + delta)
  return d
}

// Sunday-start week containing `date`.
export function getWeekDates(date) {
  const d = startOfDay(date)
  const start = addDays(d, -d.getDay())
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

// Sunday-start month grid, padded with leading/trailing days from
// neighboring months so every row has 7 cells (matches the reference UI).
export function getMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1)
  const startOffset = firstOfMonth.getDay()
  const gridStart = addDays(firstOfMonth, -startOffset)

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const lastOfMonth = new Date(year, month, daysInMonth)
  const endOffset = 6 - lastOfMonth.getDay()
  const gridEnd = addDays(lastOfMonth, endOffset)

  const cells = []
  let cursor = gridStart
  while (cursor <= gridEnd) {
    cells.push({ date: cursor, inMonth: cursor.getMonth() === month })
    cursor = addDays(cursor, 1)
  }
  return cells
}

/**
 * Whether `habit` is scheduled to appear on `date`, based on its
 * `schedule` field:
 *   { type: 'everyday' }
 *   { type: 'weekdays', weekdays: [0..6] }   // 0 = Sunday
 *   { type: 'date', date: 'YYYY-MM-DD' }     // one-off, usually tasks
 */
export function isScheduledOn(habit, date) {
  const schedule = habit.schedule || { type: 'everyday' }
  if (schedule.type === 'date') {
    return schedule.date === dateKey(date)
  }
  if (schedule.type === 'weekdays') {
    return (schedule.weekdays || []).includes(date.getDay())
  }
  return true // 'everyday'
}

// A day only "counts" toward history/calendar coloring once the habit
// existed and was scheduled that day.
export function habitExistedOn(habit, date) {
  if (!habit.createdAt) return true
  return startOfDay(date) >= startOfDay(new Date(habit.createdAt))
}

export function formatMonthYear(date) {
  return `${MONTH_LABELS[date.getMonth()]} ${date.getFullYear()}`
}

// Single source of truth for how a day is colored across the week strip
// and the calendar popup: green once it's logged done, red once a
// scheduled day has passed without being done, yellow for today (still
// actionable), and 'none' for anything outside the habit's schedule/life.
export function habitDayStatus(habit, date, todayKeyStr) {
  const key = dateKey(date)
  if (!habitExistedOn(habit, date) || !isScheduledOn(habit, date)) return 'none'
  if (key === todayKeyStr) return habit.history?.[key] === true ? 'done' : 'today'
  if (key > todayKeyStr) return 'none'
  return habit.history?.[key] === true ? 'done' : 'missed'
}