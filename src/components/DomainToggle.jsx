import { HeartPulse, Sparkles } from 'lucide-react'
import { useGame } from '../game/GameContext.jsx'

/**
 * The Health / Lifestyle switch. Flips `activeDomain` in GameContext,
 * which in turn sets `data-domain` on <html> — index.css keys the whole
 * app's accent color (green for Health, lavender for Lifestyle) off that
 * attribute with a CSS transition, so this is the single control point
 * for the "smooth transition" theming.
 */
export default function DomainToggle({ compact = false }) {
  const { activeDomain, setActiveDomain } = useGame()

  return (
    <div
      className="relative flex items-center bg-surface-light border border-border rounded-full p-1 gap-0.5"
      role="tablist"
      aria-label="Switch between Health and Lifestyle"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeDomain === 'health'}
        onClick={() => setActiveDomain('health')}
        className={`relative z-10 flex items-center gap-1.5 rounded-full text-xs font-semibold transition-colors duration-300 ${
          compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
        } ${
          activeDomain === 'health' ? 'text-bg' : 'text-gray-400 hover:text-white'
        }`}
      >
        <HeartPulse size={14} />
        {!compact && 'Health'}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeDomain === 'lifestyle'}
        onClick={() => setActiveDomain('lifestyle')}
        className={`relative z-10 flex items-center gap-1.5 rounded-full text-xs font-semibold transition-colors duration-300 ${
          compact ? 'px-2.5 py-1.5' : 'px-3.5 py-2'
        } ${
          activeDomain === 'lifestyle' ? 'text-bg' : 'text-gray-400 hover:text-white'
        }`}
      >
        <Sparkles size={14} />
        {!compact && 'Lifestyle'}
      </button>

      {/* Sliding highlight pill — animates position and color together */}
      <div
        className="absolute top-1 bottom-1 rounded-full bg-[var(--domain-accent)] transition-all duration-300 ease-out"
        style={{
          left: activeDomain === 'health' ? '4px' : '50%',
          right: activeDomain === 'health' ? '50%' : '4px',
        }}
      />
    </div>
  )
}
