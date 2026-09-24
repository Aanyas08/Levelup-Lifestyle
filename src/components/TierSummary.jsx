export default function TierSummary({ tier, count, total }) {
  const colors = {
    bronze: 'text-orange-300',
    silver: 'text-gray-200',
    gold: 'text-gold',
  }
  return (
    <div className="bg-surface border border-border rounded-xl p-4 text-center">
      <p className={`text-lg font-bold ${colors[tier] || 'text-white'}`}>{count}/{total}</p>
      <p className="text-xs text-gray-500 capitalize mt-0.5">{tier}</p>
    </div>
  )
}
