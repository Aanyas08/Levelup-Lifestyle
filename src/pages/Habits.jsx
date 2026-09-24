import { useState } from 'react'
import { Sparkles, CheckSquare, Trash2 } from 'lucide-react'
import { useGame } from '../game/GameContext.jsx'
import HabitItem from '../components/HabitItem.jsx'
import AddHabitModal from '../components/AddHabitModal.jsx'
import DomainToggle from '../components/DomainToggle.jsx'

export default function Habits() {
  const { domainHabits, activeDomain, toggleHabit, updateHabitTimer, updateHabitNumeric, removeHabit } = useGame()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalKind, setModalKind] = useState('habit')

  function openModal(kind) {
    setModalKind(kind)
    setModalOpen(true)
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">
          {activeDomain === 'health' ? 'Your health habits' : 'Your quests'}
        </h1>
        <DomainToggle compact />
      </div>
      <p className="text-gray-400 text-sm mb-6">
        {activeDomain === 'health'
          ? 'Sleep, hydration, movement, mood — whatever you want to track daily.'
          : "Add, edit, and organize the habits and tasks you're building."}
      </p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => openModal('habit')}
          className="flex items-center gap-1.5 bg-[var(--domain-accent)] text-bg font-semibold text-sm px-4 py-2.5 rounded-lg hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <Sparkles size={16} />
          New habit
        </button>
        <button
          onClick={() => openModal('task')}
          className="flex items-center gap-1.5 bg-gold text-bg font-semibold text-sm px-4 py-2.5 rounded-lg hover:brightness-110 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
        >
          <CheckSquare size={16} />
          New task
        </button>
      </div>

      <AddHabitModal open={modalOpen} initialKind={modalKind} onClose={() => setModalOpen(false)} />

      <div className="flex flex-col gap-3">
        {domainHabits.map((h) => (
          <div key={h.id} className="group relative">
            <HabitItem
              habit={h}
              onToggle={() => toggleHabit(h.id)}
              onUpdateTimer={updateHabitTimer}
              onUpdateNumeric={updateHabitNumeric}
            />
            <button
              onClick={() => removeHabit(h.id)}
              aria-label={`Delete ${h.title}`}
              className="absolute -right-2 -top-2 w-6 h-6 rounded-full bg-surface border border-border text-gray-500 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-red-400 hover:border-red-400/40 hover:scale-110 transition-all duration-150"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        {domainHabits.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-8">
            No {activeDomain === 'health' ? 'health habits' : 'quests'} yet. Add your first one above.
          </p>
        )}
      </div>
    </div>
  )
}
