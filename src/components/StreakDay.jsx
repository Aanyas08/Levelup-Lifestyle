export default function StreakDay({ label, active }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold transition-colors ${
          active ? 'bg-[var(--domain-accent)] text-bg' : 'bg-surface-light text-gray-500'
        }`}
      >
        {label[0]}
      </div>
      <span className="text-[10px] text-gray-500">{label}</span>
    </div>
  )
}
