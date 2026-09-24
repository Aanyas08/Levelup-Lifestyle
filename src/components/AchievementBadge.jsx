const tiers = {
  bronze: { from: '#F0997B', to: '#993C1D', stroke: '#D85A30', text: 'text-orange-300' },
  silver: { from: '#F1EFE8', to: '#8A8880', stroke: '#B4B2A9', text: 'text-gray-200' },
  gold: { from: '#FAC775', to: '#8A5A0B', stroke: '#EF9F27', text: 'text-gold' },
}

export default function AchievementBadge({ title, tier, unlocked, hint, index = 0 }) {
  const t = tiers[tier]
  const gradId = `medal-${tier}-${title.replace(/\s+/g, '-')}`

  return (
    <div
      className="badge-pop flex flex-col items-center text-center group"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <svg
        viewBox="0 0 100 120"
        width="84"
        height="100"
        className={`transition-transform duration-300 ease-out group-hover:scale-110 group-hover:-rotate-2 ${
          unlocked ? `badge-glow-${tier}` : 'badge-locked'
        }`}
        style={unlocked ? { color: t.stroke } : undefined}
      >
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={unlocked ? t.from : '#3A3C48'} />
            <stop offset="100%" stopColor={unlocked ? t.to : '#1A1D27'} />
          </linearGradient>
        </defs>

        <polygon
          points="32,58 24,112 50,96 76,112 68,58"
          fill={unlocked ? t.to : '#232838'}
          opacity={unlocked ? 0.9 : 0.6}
        />

        <circle cx="50" cy="46" r="38" fill={`url(#${gradId})`} stroke={unlocked ? t.stroke : '#3A3C48'} strokeWidth="3" />
        <circle cx="50" cy="46" r="29" fill="none" stroke={unlocked ? '#ffffff' : '#5A5C68'} strokeOpacity={unlocked ? 0.35 : 0.25} strokeWidth="1.2" strokeDasharray="3 4" />

        <polygon
          points="50,26 55.5,39 70,40.5 59,50 62,64.5 50,56.5 38,64.5 41,50 30,40.5 44.5,39"
          fill={unlocked ? '#ffffff' : '#4A4D58'}
          fillOpacity={unlocked ? 0.92 : 0.5}
        />
      </svg>

      <p className={`text-xs font-medium mt-1.5 ${unlocked ? 'text-white' : 'text-gray-600'}`}>
        {title}
      </p>
      {!unlocked && hint && (
        <p className="text-[11px] text-gray-600 mt-0.5">{hint}</p>
      )}
    </div>
  )
}
