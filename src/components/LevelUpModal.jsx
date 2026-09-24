import { Sparkles, Coins } from 'lucide-react'

export default function LevelUpModal({ event, onClose }) {
  if (!event) return null
  const { level, bonusCoins, rank } = event

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm levelup-backdrop px-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Level up"
    >
      <div
        className="levelup-card relative bg-surface border border-[var(--domain-accent)]/40 rounded-2xl p-8 max-w-sm w-full text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--domain-accent)]/15 flex items-center justify-center mb-4">
          <Sparkles size={28} className="text-[var(--domain-accent)]" />
        </div>
        <h2 className="text-2xl font-bold mb-1">Level {level}!</h2>
        <p className="text-sm text-gray-400 mb-4">{rank}</p>
        <p className="flex items-center justify-center gap-1.5 text-gold font-semibold text-sm mb-6">
          <Coins size={16} />
          +{bonusCoins} bonus coins
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[var(--domain-accent)] text-bg font-semibold text-sm rounded-lg py-2.5 hover:brightness-110 transition-all"
        >
          Keep going
        </button>
      </div>
    </div>
  )
}
