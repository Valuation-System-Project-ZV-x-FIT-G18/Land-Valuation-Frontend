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
  onBack: () => void
}

const ValuationList = ({
  project,
  valuations,
  loading,
  onOpen,
  onBack,
}: ValuationListProps) => (
  <div className="mx-auto max-w-3xl space-y-4">
    <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">
      ← Back to projects
    </Button>

    {/* Selected project banner */}
    <Card className="flex flex-wrap items-center justify-between gap-4 p-5">
      <p className="flex items-center gap-2 text-sm font-medium text-emerald-100">
        Project <span className="font-semibold text-gold-300">{project.projectId}</span>
        <span className="text-emerald-200/60">· NIC {project.nic}</span>
      </p>
      <StatusBadge status={project.status} />
    </Card>

    <h3 className="pt-2 text-sm font-semibold uppercase tracking-wide text-emerald-200/50">
      Valuations
    </h3>

    {loading ? (
      <p className="text-center text-sm text-emerald-200/60">Loading valuations…</p>
    ) : valuations.length === 0 ? (
      <Card className="p-8 text-center">
        <p className="font-semibold text-gold-200">No valuations yet</p>
        <p className="mt-1 text-sm text-emerald-100/70">
          This project has no valuations raised against it.
        </p>
      </Card>
    ) : (
      <div className="grid gap-3">
        {valuations.map((v) => (
          <button
            key={v.rowId}
            type="button"
            onClick={() => onOpen(v)}
            className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-gold-400/40 hover:bg-white/10"
          >
            <div>
              <p className="font-semibold text-gold-300">Valuation #{v.valuationId}</p>
              <p className="mt-0.5 text-xs text-emerald-200/50">
                Created {formatDate(v.createdAt)} · tap to view its progress
              </p>
            </div>
            <span className="text-emerald-200/40 transition group-hover:translate-x-0.5 group-hover:text-gold-300">
              →
            </span>
          </button>
        ))}
      </div>
    )}
  </div>
)

export default ValuationList
