import { Flame, Star, TrendingUp, Trophy } from 'lucide-react'
import StatCard from '../components/StatCard.jsx'
import WeeklyProgress from '../components/WeeklyProgress.jsx'
import HabitProgressRow from '../components/HabitProgressRow.jsx'
import DomainToggle from '../components/DomainToggle.jsx'
import { useGame } from '../game/GameContext.jsx'

export default function Progress() {
  const { player, dailyCompletionPct, weeklyProgress, domainHabits, activeDomain } = useGame()

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Your progress</h1>
        <DomainToggle compact />
      </div>
      <p className="text-gray-400 text-sm mb-6">
        A look at how consistent you've been {activeDomain === 'health' ? 'health-wise' : 'on your quests'}.
      </p>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard icon={Flame} iconColor="text-orange-400" value={`${player.currentStreak} days`} label="Current streak" />
        <StatCard icon={Star} iconColor="text-[var(--domain-accent)]" value={player.totalXpEarned} label="Total XP" />
        <StatCard icon={TrendingUp} iconColor="text-[var(--domain-accent)]" value={`${dailyCompletionPct}%`} label="Today's completion" />
        <StatCard icon={Trophy} iconColor="text-gold" value={player.level} label="Level" />
      </div>

      <WeeklyProgress weeklyProgress={weeklyProgress} />

      {domainHabits.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center text-sm text-gray-500">
          No {activeDomain === 'health' ? 'health habits' : 'quests'} yet — add one from the Habits page to see its
          progress here.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {domainHabits.map((h) => (
            <HabitProgressRow key={h.id} habit={h} />
          ))}
        </div>
      )}
    </div>
  )
}