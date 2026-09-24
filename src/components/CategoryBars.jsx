import { HEALTH_CATEGORY_ICONS } from '../game/iconRegistry.js'

/**
 * Vertical list of "category name — progress bar — %" rows, matching the
 * Sleep / Hydration / ... list from the wellness dashboard mockup. Works
 * for either domain: health categories get their dedicated icons, any
 * other category (lifestyle) falls back to a generic target icon.
 */
export default function CategoryBars({ categories }) {
  if (categories.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-2xl p-8 text-center text-sm text-gray-500">
        Nothing to show yet — add a habit or task to start tracking progress here.
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <p className="text-sm font-medium text-gray-300 mb-4">Progress by category</p>
      <div className="flex flex-col gap-4">
        {categories.map(({ category, pct }) => {
          const Icon = HEALTH_CATEGORY_ICONS[category] || HEALTH_CATEGORY_ICONS.Other
          return (
            <div key={category} className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-md bg-[var(--domain-accent)]/10 text-[var(--domain-accent)] flex items-center justify-center shrink-0">
                <Icon size={13} />
              </span>
              <span className="text-xs font-medium text-gray-300 w-24 truncate">{category}</span>
              <div className="flex-1 h-2 bg-surface-light rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--domain-accent)] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-[var(--domain-accent)] w-9 text-right">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
