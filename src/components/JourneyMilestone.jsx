export default function JourneyMilestone({ label, reached }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 rounded-full ${reached ? 'bg-[var(--domain-accent)]' : 'bg-surface-light'}`} />
      <span className={`text-xs ${reached ? 'text-white' : 'text-gray-500'}`}>{label}</span>
    </div>
  )
}
