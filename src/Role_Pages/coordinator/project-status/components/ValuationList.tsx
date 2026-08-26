import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import StatusBadge from '@/Role_Pages/coordinator/project-status/components/StatusBadge'
import { formatDate } from '@/Role_Pages/coordinator/project-status/api/project-status'
import type {
  ProjectRow,
  ValuationRow,
} from '@/Role_Pages/coordinator/project-status/types/project-status'

// Level 2: the valuations raised against one project.
// Clicking a valuation opens its status detail.
type ValuationListProps = {
  project: ProjectRow
  valuations: ValuationRow[]
  loading: boolean
  onOpen: (valuation: ValuationRow) => void
  onAddValuation?: () => void
  onBack: () => void
}

const ValuationList = ({
  project,
  valuations,
  loading,
  onOpen,
  onAddValuation,
  onBack,
}: ValuationListProps) => (
  <div className="mx-auto max-w-6xl space-y-4">
    <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">
      ← Back to projects
    </Button>

    {/* Selected project banner */}
    <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-100">
        Project <span className="font-semibold text-accent-300">{project.projectId}</span>
        <span className="text-emerald-200">· NIC {project.nic}</span>
      </p>
    </Card>

    <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
      <div>
        <h3 className="text-lg font-semibold text-white">Valuations</h3>
        <p className="mt-1 text-sm text-emerald-100">
          Initial valuation and every revaluation for this property.
        </p>
      </div>
      {onAddValuation && (
        <Button type="button" onClick={onAddValuation} className="!px-5 !py-2.5 text-sm">
          {valuations.length === 0 ? '+ Create Initial Valuation' : '+ Create Revaluation'}
        </Button>
      )}
    </div>

    {loading ? (
      <p className="text-center text-sm text-emerald-200">Loading valuations…</p>
    ) : valuations.length === 0 ? (
      <Card className="p-8 text-center">
        <p className="font-semibold text-accent-200">No valuations yet</p>
        <p className="mt-1 text-sm text-emerald-100">
          This property project is ready for its initial valuation request.
        </p>
      </Card>
    ) : (
      <div className="grid gap-3">
        {valuations.map((v) => (
          <button
            key={v.rowId}
            type="button"
            onClick={() => onOpen(v)}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-accent-400/40 hover:bg-white/10"
          >
            <div className="min-w-0">
              <p className="font-semibold text-accent-300">
                {v.valuationId === 1 ? 'Initial valuation' : `Revaluation ${v.valuationId - 1}`}
              </p>
              <p className="mt-0.5 text-xs text-emerald-200">
                Valuation #{v.valuationId} · Created {formatDate(v.createdAt)} · View progress
              </p>
              <p className="mt-1 truncate text-xs text-emerald-100/60">
                {v.bankName ? `${v.bankName}${v.branchName ? ` · ${v.branchName}` : ''}` : 'Bank request not specified'}
              </p>
              <p className="mt-0.5 truncate text-xs text-emerald-100/60">
                {v.technicalOfficerId
                  ? `${v.technicalOfficerName || v.technicalOfficerId}${v.inspectionDate ? ` · Inspection ${formatDate(v.inspectionDate)}${v.inspectionTime ? ` at ${v.inspectionTime}` : ''}` : ''}`
                  : 'Technical Officer not assigned'}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <StatusBadge status={v.status} />
              <span className="text-emerald-200 transition group-hover:translate-x-0.5 group-hover:text-accent-300">
                →
              </span>
            </div>
          </button>
        ))}
      </div>
    )}
  </div>
)

export default ValuationList
