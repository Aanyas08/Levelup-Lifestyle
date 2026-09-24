export default function LevelRing({ level, xp, xpCap, size = 72 }) {
  const stroke = 6
  const r = (size - stroke) / 2
  const circumference = 2 * Math.PI * r
  const pct = Math.min(1, xp / xpCap)
  const offset = circumference * (1 - pct)

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--surface-light, #262A38)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--domain-accent)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none">{level}</span>
        <span className="text-[10px] text-gray-400 leading-none mt-0.5">LVL</span>
      </div>
    </div>
  )
}
