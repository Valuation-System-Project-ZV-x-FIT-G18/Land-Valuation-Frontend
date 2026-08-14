// Trust indicators for the hero section.
// Four key stats that build credibility, shown as a simple responsive grid.

// The data is kept in one array so it is easy to read and edit.
const stats = [
  { value: '24', label: 'District Coverage' },
  { value: '15+', label: 'Years Industry Experience' },
  { value: '25,000+', label: 'Valuations Completed' },
  { value: '5-Day', label: 'Average Turnaround' },
]

const TrustIndicators = () => {
  return (
    <dl className="grid grid-cols-2 gap-4 sm:gap-6 lg:max-w-lg">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-gold-400/40"
        >
          <dt className="text-2xl font-bold text-gold-400 sm:text-3xl">
            {stat.value}
          </dt>
          <dd className="mt-1 text-xs font-medium text-emerald-100/80 sm:text-sm">
            {stat.label}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default TrustIndicators
