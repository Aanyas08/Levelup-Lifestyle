import { useState } from 'react'
import { X, CheckSquare, Timer, Hash, Sparkles, HeartPulse } from 'lucide-react'
import { useGame } from '../game/GameContext.jsx'
import { DIFFICULTIES } from '../game/xpCurve.js'
import { ICONS, COLOR_CLASSES } from '../game/iconRegistry.js'

const TRACKING_OPTIONS = [
  { value: 'tick', label: 'Yes / No', hint: 'Simple checkbox — done or not.', icon: CheckSquare },
  { value: 'timer', label: 'Timer', hint: 'Count up to a target duration.', icon: Timer },
  { value: 'numeric', label: 'Numeric', hint: 'Log a value against any unit.', icon: Hash },
]

const HEALTH_CATEGORY_SUGGESTIONS = ['Sleep', 'Hydration', 'Energy', 'Nutrition', 'Fitness', 'Mood', 'Mindfulness']
const LIFESTYLE_CATEGORY_SUGGESTIONS = ['Discipline', 'Learning', 'Career', 'Finance', 'Social', 'Home']

const COLOR_KEYS = Object.keys(COLOR_CLASSES)
const ICON_KEYS = Object.keys(ICONS)

export default function AddHabitModal({ open, initialKind = 'habit', onClose }) {
  const { addHabit, activeDomain } = useGame()

  const [domain, setDomain] = useState(activeDomain)
  const [kind, setKind] = useState(initialKind)
  const [trackingType, setTrackingType] = useState('tick')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Discipline')
  const [difficulty, setDifficulty] = useState('Medium')
  const [frequency, setFrequency] = useState('Daily')
  const [icon, setIcon] = useState('Sparkles')
  const [color, setColor] = useState('teal')
  const [timerMinutes, setTimerMinutes] = useState(10)
  const [numericTarget, setNumericTarget] = useState(10)
  const [numericUnit, setNumericUnit] = useState('reps')

  if (!open) return null

  const categorySuggestions = domain === 'health' ? HEALTH_CATEGORY_SUGGESTIONS : LIFESTYLE_CATEGORY_SUGGESTIONS

  function resetAndClose() {
    setDomain(activeDomain)
    setTitle('')
    setTrackingType('tick')
    setKind(initialKind)
    setCategory(domain === 'health' ? 'Sleep' : 'Discipline')
    setDifficulty('Medium')
    setFrequency('Daily')
    setIcon('Sparkles')
    setColor('teal')
    setTimerMinutes(10)
    setNumericTarget(10)
    setNumericUnit('reps')
    onClose()
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return

    addHabit({
      title: title.trim(),
      domain,
      category,
      difficulty,
      frequency,
      icon,
      color,
      kind,
      trackingType,
      timerTargetSeconds: Math.max(60, Math.round(timerMinutes * 60)),
      numericTarget: Math.max(1, Number(numericTarget) || 1),
      numericUnit: numericUnit.trim() || 'reps',
    })
    resetAndClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm levelup-backdrop px-4"
      onClick={resetAndClose}
      role="dialog"
      aria-modal="true"
      aria-label={kind === 'task' ? 'New task' : 'New habit'}
    >
      <div
        className="relative levelup-card w-full max-w-lg bg-surface border border-border rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={resetAndClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-bold mb-1">New {kind === 'task' ? 'task' : 'habit'}</h2>
        <p className="text-sm text-gray-400 mb-5">
          {kind === 'task' ? "A one-off — no streak, just get it done." : "Something you'll build a streak on."}
        </p>

        {/* Health vs Lifestyle domain toggle */}
        <div className="grid grid-cols-2 gap-2 mb-3 bg-surface-light rounded-xl p-1">
          <button
            type="button"
            onClick={() => { setDomain('health'); setCategory('Sleep') }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
              domain === 'health' ? 'bg-[var(--health-accent)] text-bg shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <HeartPulse size={14} />
            Health
          </button>
          <button
            type="button"
            onClick={() => { setDomain('lifestyle'); setCategory('Discipline') }}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
              domain === 'lifestyle' ? 'bg-[var(--lifestyle-accent)] text-bg shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            Lifestyle
          </button>
        </div>

        {/* Habit vs Task toggle */}
        <div className="grid grid-cols-2 gap-2 mb-5 bg-surface-light rounded-xl p-1">
          <button
            type="button"
            onClick={() => setKind('habit')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
              kind === 'habit' ? 'bg-[var(--domain-accent)] text-bg shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            Habit
          </button>
          <button
            type="button"
            onClick={() => setKind('task')}
            className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
              kind === 'task' ? 'bg-gold text-bg shadow-sm' : 'text-gray-400 hover:text-white'
            }`}
          >
            <CheckSquare size={14} />
            Task
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-400">Title</span>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={domain === 'health' ? 'Sleep 8 hours' : 'Meditate for 10 minutes'}
              className="bg-surface-light border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--domain-accent)]/60 transition-colors"
            />
          </label>

          <div>
            <span className="text-xs font-medium text-gray-400 mb-2 block">How do you want to track it?</span>
            <div className="grid grid-cols-3 gap-2">
              {TRACKING_OPTIONS.map(({ value, label, hint, icon: OptIcon }) => {
                const active = trackingType === value
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTrackingType(value)}
                    title={hint}
                    className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-all duration-200 hover:-translate-y-0.5 ${
                      active
                        ? 'border-[var(--domain-accent)] bg-[var(--domain-accent)]/10 text-[var(--domain-accent)]'
                        : 'border-border text-gray-400 hover:border-[var(--domain-accent)]/40 hover:text-white'
                    }`}
                  >
                    <OptIcon size={18} />
                    <span className="text-xs font-semibold">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {trackingType === 'timer' && (
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-400">Target duration (minutes)</span>
              <input
                type="number"
                min={1}
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(e.target.value)}
                className="bg-surface-light border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--domain-accent)]/60 transition-colors"
              />
            </label>
          )}

          {trackingType === 'numeric' && (
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-400">Target value</span>
                <input
                  type="number"
                  min={1}
                  value={numericTarget}
                  onChange={(e) => setNumericTarget(e.target.value)}
                  className="bg-surface-light border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--domain-accent)]/60 transition-colors"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-400">Unit</span>
                <input
                  value={numericUnit}
                  onChange={(e) => setNumericUnit(e.target.value)}
                  placeholder="hours, glasses, pages…"
                  className="bg-surface-light border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--domain-accent)]/60 transition-colors"
                />
              </label>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-400">Category</span>
              <input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-suggestions"
                className="bg-surface-light border border-border rounded-lg px-2.5 py-2.5 text-sm focus:outline-none focus:border-[var(--domain-accent)]/60 transition-colors"
              />
              <datalist id="category-suggestions">
                {categorySuggestions.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-400">Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="bg-surface-light border border-border rounded-lg px-2.5 py-2.5 text-sm focus:outline-none focus:border-[var(--domain-accent)]/60 transition-colors"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-400">Frequency</span>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                disabled={kind === 'task'}
                className="bg-surface-light border border-border rounded-lg px-2.5 py-2.5 text-sm focus:outline-none focus:border-[var(--domain-accent)]/60 transition-colors disabled:opacity-50"
              >
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </label>
          </div>

          <div>
            <span className="text-xs font-medium text-gray-400 mb-2 block">Icon</span>
            <div className="grid grid-cols-8 gap-1.5">
              {ICON_KEYS.map((key) => {
                const Icon = ICONS[key]
                const active = icon === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIcon(key)}
                    aria-label={key}
                    className={`aspect-square rounded-lg flex items-center justify-center transition-all duration-150 hover:scale-110 ${
                      active ? 'bg-[var(--domain-accent)] text-bg' : 'bg-surface-light text-gray-400 hover:text-white'
                    }`}
                  >
                    <Icon size={15} />
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <span className="text-xs font-medium text-gray-400 mb-2 block">Color</span>
            <div className="flex gap-2 flex-wrap">
              {COLOR_KEYS.map((key) => {
                const { text } = COLOR_CLASSES[key]
                const active = color === key
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setColor(key)}
                    aria-label={key}
                    className={`w-8 h-8 rounded-full transition-all duration-150 hover:scale-110 ${text.replace('text-', 'bg-')} ${
                      active ? 'ring-2 ring-offset-2 ring-offset-surface ring-white scale-110' : 'opacity-70'
                    }`}
                  />
                )
              })}
            </div>
          </div>

          <button
            type="submit"
            className="mt-1 bg-[var(--domain-accent)] text-bg font-semibold text-sm rounded-lg py-2.5 hover:brightness-110 hover:scale-[1.01] active:scale-[0.98] transition-all"
          >
            Create {kind === 'task' ? 'task' : 'habit'}
          </button>
        </form>
      </div>
    </div>
  )
}
