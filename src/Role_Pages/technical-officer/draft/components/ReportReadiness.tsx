import type { ReportReadiness as Readiness } from '@/Role_Pages/technical-officer/draft/utils/reportReadiness'

const ReportReadiness = ({ readiness }: { readiness: Readiness }) => {
  const colour = readiness.blockers.length ? 'text-red-200' : readiness.warnings.length ? 'text-amber-200' : 'text-emerald-200'
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5" aria-labelledby="report-readiness-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="report-readiness-title" className="font-semibold text-white">Report readiness</h2>
          <p className="mt-1 text-xs text-emerald-100">Review report completeness before manager submission.</p>
        </div>
        <strong className={`text-2xl ${colour}`}>{readiness.score}%</strong>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-black/25">
        <div className="h-full rounded-full bg-accent-400 transition-all" style={{ width: `${readiness.score}%` }} />
      </div>
      <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        {readiness.checks.map((check) => (
          <li key={check.label} className={`flex items-start gap-2 ${check.passed ? 'text-emerald-100' : 'text-amber-200'}`}>
            <span className="font-bold" aria-hidden>{check.passed ? 'Passed' : 'Review'}</span>
            <span>{check.label}{check.detail ? ` — ${check.detail}` : ''}</span>
          </li>
        ))}
      </ul>
      {readiness.blockers.length > 0 && (
        <p className="mt-4 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-100">
          Submission blocked: {readiness.blockers.join(' ')}
        </p>
      )}
    </section>
  )
}

export default ReportReadiness
