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
          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cyan-300 hover:shadow-md"
        >
          <dt className="text-2xl font-bold text-brand-blue sm:text-3xl">
            {stat.value}
          </dt>
          <dd className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
            {stat.label}
          </dd>
        </div>
      ))}
    </dl>
  )
}

export default TrustIndicators
