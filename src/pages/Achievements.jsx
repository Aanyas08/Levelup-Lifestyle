import AchievementBadge from '../components/AchievementBadge.jsx'
import DomainToggle from '../components/DomainToggle.jsx'
import { useGame } from '../game/GameContext.jsx'

const BADGES = [
  { title: '7-day streak', tier: 'bronze', minStreak: 7 },
  { title: 'Level 5', tier: 'silver', minLevel: 5 },
  { title: '50 habits done', tier: 'gold', minCompletions: 50 },
  { title: '14-day streak', tier: 'silver', minStreak: 14 },
  { title: 'Level 10', tier: 'gold', minLevel: 10 },
  { title: '100 habits done', tier: 'gold', minCompletions: 100 },
]

export default function Achievements() {
  const { player, habits } = useGame()
  const totalCompletions = habits.reduce((sum, h) => sum + h.totalCompletions, 0)

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Achievements</h1>
        <DomainToggle compact />
      </div>
      <p className="text-gray-400 text-sm mb-6">Badges you've earned across every habit and task.</p>

      <div className="grid grid-cols-3 sm:grid-cols-4 gap-6 bg-surface border border-border rounded-2xl p-6">
        {BADGES.map((b, i) => {
          const unlocked =
            (b.minStreak && player.longestStreak >= b.minStreak) ||
            (b.minLevel && player.level >= b.minLevel) ||
            (b.minCompletions && totalCompletions >= b.minCompletions)
          return (
            <AchievementBadge
              key={b.title}
              title={b.title}
              tier={b.tier}
              unlocked={!!unlocked}
              hint={!unlocked ? 'Keep going' : undefined}
              index={i}
            />
          )
        })}
      </div>
    </div>
  )
}
