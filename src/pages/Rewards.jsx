import { Coins } from 'lucide-react'
import DomainToggle from '../components/DomainToggle.jsx'
import { useGame } from '../game/GameContext.jsx'

const REWARDS = [
  { title: 'Coffee break', cost: 20 },
  { title: 'Episode of a show', cost: 40 },
  { title: 'New song / album', cost: 60 },
  { title: 'Takeout night', cost: 100 },
  { title: 'Something small you want', cost: 200 },
]

export default function Rewards() {
  const { player } = useGame()

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-bold">Rewards</h1>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-gold font-semibold text-sm">
            <Coins size={16} />
            {player.coins} coins
          </span>
          <DomainToggle compact />
        </div>
      </div>
      <p className="text-gray-400 text-sm mb-6">Spend the coins your habits earn you on something real.</p>

      <div className="flex flex-col gap-3">
        {REWARDS.map((r) => {
          const affordable = player.coins >= r.cost
          return (
            <div
              key={r.title}
              className="flex items-center justify-between bg-surface border border-border rounded-xl px-4 py-3"
            >
              <span className="text-sm font-medium">{r.title}</span>
              <button
                disabled={!affordable}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  affordable
                    ? 'bg-[var(--domain-accent)] text-bg hover:brightness-110'
                    : 'bg-surface-light text-gray-500 cursor-not-allowed'
                }`}
              >
                <Coins size={13} />
                {r.cost}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
