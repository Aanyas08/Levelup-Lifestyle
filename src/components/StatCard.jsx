export default function StatCard({ icon: Icon, iconColor, value, label }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-3 hover:border-[var(--domain-accent)]/30 transition-colors">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/5 ${iconColor}`}>
        <Icon size={18} />
      </span>
      <span className="min-w-0">
        <p className="text-lg font-bold truncate">{value}</p>
        <p className="text-xs text-gray-500 truncate">{label}</p>
      </span>
    </div>
  )
}
