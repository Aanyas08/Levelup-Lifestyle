/**
 * Small "trend" card with a headline % and a sparkline — the equivalent
 * of the Energy / Health Stat cards in the wellness mockup, generalized
 * to work off any {key, pct}[] series (pct may be null for days with
 * nothing scheduled — those are skipped from the line).
 */
export default function SparkTrendCard({ title, subtitle, data }) {
  const points = data.filter((d) => d.pct !== null)
  const latest = points.length ? points[points.length - 1].pct : null

  const width = 240
  const height = 56
  const path = points.length
    ? points
        .map((d, i) => {
          const x = points.length === 1 ? width : (i / (points.length - 1)) * width
          const y = height - (d.pct / 100) * height
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
        })
        .join(' ')
    : ''

  return (
    <div className="bg-[var(--domain-accent-soft)] border border-[var(--domain-accent)]/20 rounded-2xl p-4 flex flex-col justify-between min-h-[128px] transition-colors duration-300">
      <div>
        <p className="text-xs font-semibold text-gray-300">{title}</p>
        <p className="text-2xl font-bold text-[var(--domain-accent)] mt-0.5">
          {latest === null ? '—' : `${latest}%`}
        </p>
        {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {path && (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-10 mt-2" preserveAspectRatio="none">
          <path d={path} fill="none" stroke="var(--domain-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  )
}
