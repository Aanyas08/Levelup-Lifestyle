import DailyQuoteCard from '../components/DailyQuoteCard.jsx'
import WeeklyProgress from '../components/WeeklyProgress.jsx'
import MonthGlance from '../components/MonthGlance.jsx'
import HabitItem from '../components/HabitItem.jsx'
import LevelUpModal from '../components/LevelUpModal.jsx'
import { HEALTH_CATEGORY_ICONS } from '../game/iconRegistry.js'
import { useGame } from '../game/GameContext.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

function CategoryCard({ group, toggleHabit, updateHabitTimer, updateHabitNumeric }) {
  const Icon = HEALTH_CATEGORY_ICONS[group.category] || HEALTH_CATEGORY_ICONS.Other

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-[var(--domain-accent)]/30 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-lg bg-[var(--domain-accent)]/10 text-[var(--domain-accent)] flex items-center justify-center">
            <Icon size={16} />
          </span>
          <span className="text-sm font-semibold">{group.category}</span>
        </span>
        <span className="text-sm font-bold text-[var(--domain-accent)]">{group.pct}%</span>
      </div>
      <div className="h-1.5 bg-surface-light rounded-full overflow-hidden mb-4">
        <div
          className="h-full bg-[var(--domain-accent)] rounded-full transition-all duration-500"
          style={{ width: `${group.pct}%` }}
        />
      </div>
      <div className="flex flex-col gap-2">
        {group.habits.map((h) => (
          <HabitItem
            key={h.id}
            habit={h}
            onToggle={() => toggleHabit(h.id)}
            onUpdateTimer={updateHabitTimer}
            onUpdateNumeric={updateHabitNumeric}
          />
        ))}
      </div>
    </div>
  )
}

// Both domains render this exact same structure — banner, quote, weekly
// strip, category cards, month calendar — just pointed at whichever
// domain's habits and accent color are currently active.
export default function Dashboard() {
  const {
    player, activeDomain, domainCategories, domainHabits, weeklyProgress,
    toggleHabit, updateHabitTimer, updateHabitNumeric, levelUpEvent, clearLevelUpEvent,
  } = useGame()
  const { user } = useAuth()

  const isHealth = activeDomain === 'health'

  return (
    <div className="max-w-6xl">
      <LevelUpModal event={levelUpEvent} onClose={clearLevelUpEvent} />

      <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
        <h1 className="text-2xl font-bold">{isHealth ? 'Wellness dashboard' : 'Quest dashboard'}</h1>
        <p className="text-gray-400 text-sm mt-1">
          Hey {user?.name || player.name} — here's how your {isHealth ? 'health habits are' : 'quests are'} tracking today.
        </p>
      </div>

      <DailyQuoteCard />
      <WeeklyProgress weeklyProgress={weeklyProgress} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <div className="lg:col-span-2">
          {domainCategories.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center text-sm text-gray-500">
              No {isHealth ? 'health habits' : 'quests'} yet. Head to the Habits page and add one under the{' '}
              {isHealth ? 'Health' : 'Lifestyle'} tab.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {domainCategories.map((group) => (
                <CategoryCard
                  key={group.category}
                  group={group}
                  toggleHabit={toggleHabit}
                  updateHabitTimer={updateHabitTimer}
                  updateHabitNumeric={updateHabitNumeric}
                />
              ))}
            </div>
          )}
        </div>

        <MonthGlance habits={domainHabits} />
      </div>
    </div>
  )
}
