export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-5 hover:border-[var(--domain-accent)]/30 hover:-translate-y-0.5 transition-all duration-200">
      <span className="w-10 h-10 rounded-xl bg-[var(--domain-accent)]/10 text-[var(--domain-accent)] flex items-center justify-center mb-3">
        <Icon size={18} />
      </span>
      <h3 className="text-sm font-semibold mb-1">{title}</h3>
      <p className="text-xs text-gray-400">{description}</p>
    </div>
  )
}
