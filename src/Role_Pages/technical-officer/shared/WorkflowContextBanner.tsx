import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

type Props = {
  projectId: string
  assignment?: Assignment | null
}

const WorkflowContextBanner = ({ projectId, assignment }: Props) => (
  <section
    aria-label="Current valuation"
    className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent-400/25 bg-accent-400/[0.07] px-5 py-4 shadow-sm"
  >
    <div className="min-w-0">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent-300">Current valuation</p>
      <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 className="text-lg font-semibold text-white">{projectId}</h2>
        {assignment && <span className="text-sm text-emerald-100">Valuation #{assignment.valuationId}</span>}
      </div>
    </div>
    <dl className="grid min-w-0 gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">Applicant</dt>
        <dd className="max-w-56 truncate font-medium text-white">{assignment?.owner.name || 'Not available'}</dd>
      </div>
      <div>
        <dt className="text-[10px] font-semibold uppercase tracking-wide text-emerald-200">Property</dt>
        <dd className="max-w-56 truncate font-medium text-white">{assignment?.project.propertyType || 'Property valuation'}</dd>
      </div>
    </dl>
  </section>
)

export default WorkflowContextBanner
