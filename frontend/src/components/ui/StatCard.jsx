function StatCard({ label, value, tone = 'indigo' }) {
  const toneMap = {
    indigo: 'from-indigo-500/10 to-violet-500/10 text-indigo-700',
    emerald: 'from-emerald-500/10 to-teal-500/10 text-emerald-700',
    amber: 'from-amber-500/10 to-orange-500/10 text-amber-700',
  }

  return (
    <div className="surface-card surface-card-hover animate-enter overflow-hidden">
      <div className={`bg-gradient-to-br p-4 ${toneMap[tone] || toneMap.indigo}`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      </div>
    </div>
  )
}

export default StatCard
