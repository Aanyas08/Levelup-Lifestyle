
// 

import { useEffect, useRef, useState } from 'react'
import { Check, Play, Pause, RotateCcw, Minus, Plus } from 'lucide-react'
import { getIcon, colorClasses } from '../game/iconRegistry.js'

const DIFFICULTY_STYLES = {
  Easy: 'text-teal bg-teal/10',
  Medium: 'text-blue-300 bg-blue-400/10',
  Hard: 'text-orange-300 bg-orange-400/10',
  Epic: 'text-purple bg-purple/10',
}

function formatSeconds(total) {
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

function HabitFrame({ habit, children }) {
  const { icon, color, title, frequency, xp, coins, done, difficulty, currentStreak, kind, trackingType } = habit
  const Icon = getIcon(icon)
  const { text: iconColor, bg: iconBg } = colorClasses(color)
  // Tick controls are a small fixed-size button and fit fine inline.
  // Timer/numeric controls carry a progress bar plus buttons, which was
  // getting squeezed into the same row as the title and XP badge inside
  // narrow category cards, causing text to overlap. Give those their
  // own full-width row instead.
  const inline = trackingType === 'tick' || !trackingType

  return (
    <div
      className={`flex flex-col gap-2.5 bg-surface border rounded-xl px-4 py-3 transition-all duration-200 ${
        done
          ? 'border-[var(--domain-accent)]/30 bg-[var(--domain-accent)]/[0.04] opacity-60'
          : 'border-border hover:border-[var(--domain-accent)]/30'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${iconBg}`}>
          <Icon size={17} className={iconColor} />
        </span>

        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium truncate text-white">
              {title}
            </p>
            {difficulty && (
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${DIFFICULTY_STYLES[difficulty]}`}>
                {difficulty}
              </span>
            )}
            {kind === 'task' && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded text-gold bg-gold/10">
                Task
              </span>
            )}
          </span>
          <p className="text-xs text-gray-500">
            {frequency}
            {currentStreak > 0 && <span className="text-orange-400"> · 🔥 {currentStreak}</span>}
          </p>
        </span>

        {inline && children}

        <span className="flex flex-col items-end shrink-0 pl-1">
          <span className="text-sm font-medium text-[var(--domain-accent)]">+{xp} XP</span>
          <span className="text-xs text-gold">+{coins} coins</span>
        </span>
      </div>

      {!inline && <div className="pl-12">{children}</div>}
    </div>
  )
}

function TickControl({ habit, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={habit.done ? 'Mark incomplete' : 'Mark complete'}
      className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-110 active:scale-95 ${
        habit.done ? 'bg-[var(--domain-accent)] border-[var(--domain-accent)]' : 'border-gray-500 hover:border-[var(--domain-accent)]'
      }`}
    >
      {habit.done && <Check size={16} className="text-bg" strokeWidth={3} />}
    </button>
  )
}

function TimerControl({ habit, onUpdateTimer }) {
  const [localElapsed, setLocalElapsed] = useState(habit.timerElapsedSeconds)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!running) return
    intervalRef.current = setInterval(() => {
      setLocalElapsed((prev) => {
        const next = Math.min(prev + 1, habit.timerTargetSeconds)
        if (next >= habit.timerTargetSeconds) {
          clearInterval(intervalRef.current)
          setRunning(false)
          onUpdateTimer(next)
        }
        return next
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running])

  useEffect(() => () => clearInterval(intervalRef.current), [])

  function toggleRunning() {
    if (running) {
      clearInterval(intervalRef.current)
      setRunning(false)
      onUpdateTimer(localElapsed)
    } else {
      setRunning(true)
    }
  }

  function reset() {
    clearInterval(intervalRef.current)
    setRunning(false)
    setLocalElapsed(0)
    onUpdateTimer(0)
  }

  const pct = Math.min(100, Math.round((localElapsed / habit.timerTargetSeconds) * 100))

  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className="flex-1">
        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
          <span className={running ? 'text-[var(--domain-accent)] font-medium' : ''}>{formatSeconds(localElapsed)}</span>
          <span>{formatSeconds(habit.timerTargetSeconds)}</span>
        </div>
        <div className="h-1.5 bg-surface-light rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--domain-accent)] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <button
        onClick={toggleRunning}
        aria-label={running ? 'Pause timer' : 'Start timer'}
        disabled={habit.done}
        className="w-8 h-8 rounded-lg bg-[var(--domain-accent)]/10 text-[var(--domain-accent)] flex items-center justify-center hover:bg-[var(--domain-accent)]/20 hover:scale-110 active:scale-95 transition-all duration-200 disabled:opacity-40 disabled:hover:scale-100"
      >
        {running ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
      </button>
      <button
        onClick={reset}
        aria-label="Reset timer"
        className="w-8 h-8 rounded-lg bg-surface-light text-gray-400 flex items-center justify-center hover:text-white hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <RotateCcw size={13} />
      </button>
    </div>
  )
}

function NumericControl({ habit, onUpdateNumeric }) {
  const step = Math.max(1, Math.round(habit.numericTarget / 10))

  function adjust(delta) {
    onUpdateNumeric(Math.max(0, habit.numericValue + delta))
  }

  const pct = Math.min(100, Math.round((habit.numericValue / habit.numericTarget) * 100))

  return (
    <div className="flex items-center gap-2.5 w-full">
      <div className="flex-1">
        <div className="flex justify-between text-[11px] text-gray-500 mb-1">
          <span className={habit.done ? 'text-[var(--domain-accent)] font-medium' : ''}>
            {habit.numericValue} / {habit.numericTarget}
          </span>
          <span className="truncate max-w-[80px]">{habit.numericUnit}</span>
        </div>
        <div className="h-1.5 bg-surface-light rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--domain-accent)] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <button
        onClick={() => adjust(-step)}
        aria-label="Decrease"
        className="w-7 h-7 rounded-lg bg-surface-light text-gray-400 flex items-center justify-center hover:text-white hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <Minus size={13} />
      </button>
      <button
        onClick={() => adjust(step)}
        aria-label="Increase"
        className="w-7 h-7 rounded-lg bg-[var(--domain-accent)]/10 text-[var(--domain-accent)] flex items-center justify-center hover:bg-[var(--domain-accent)]/20 hover:scale-110 active:scale-95 transition-all duration-200"
      >
        <Plus size={13} />
      </button>
    </div>
  )
}

export default function HabitItem({ habit, onToggle, onUpdateTimer, onUpdateNumeric }) {
  return (
    <HabitFrame habit={habit}>
      {habit.trackingType === 'timer' && (
        <TimerControl habit={habit} onUpdateTimer={(v) => onUpdateTimer?.(habit.id, v)} />
      )}
      {habit.trackingType === 'numeric' && (
        <NumericControl habit={habit} onUpdateNumeric={(v) => onUpdateNumeric?.(habit.id, v)} />
      )}
      {(habit.trackingType === 'tick' || !habit.trackingType) && (
        <TickControl habit={habit} onToggle={onToggle} />
      )}
    </HabitFrame>
  )
}