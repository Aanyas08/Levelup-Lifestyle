import { useGame } from '../game/GameContext.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import LevelRing from '../components/LevelRing.jsx'
import DomainToggle from '../components/DomainToggle.jsx'
import { xpForLevel } from '../game/xpCurve.js'

export default function Profile() {
  const { player, rank } = useGame()
  const { user } = useAuth()
  const xpCap = xpForLevel(player.level)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <DomainToggle compact />
      </div>

      <div className="bg-surface border border-border rounded-2xl p-6 flex items-center gap-5 mb-6">
        <LevelRing level={player.level} xp={player.xp} xpCap={xpCap} size={80} />
        <div>
          <p className="text-lg font-bold">{user?.name || player.name}</p>
          <p className="text-sm text-gray-400">{rank}</p>
          <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-[var(--domain-accent)]">{player.totalXpEarned}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total XP</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-gold">{player.coins}</p>
          <p className="text-xs text-gray-500 mt-0.5">Coins</p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-orange-400">{player.longestStreak}</p>
          <p className="text-xs text-gray-500 mt-0.5">Best streak</p>
        </div>
      </div>
    </div>
  )
}
