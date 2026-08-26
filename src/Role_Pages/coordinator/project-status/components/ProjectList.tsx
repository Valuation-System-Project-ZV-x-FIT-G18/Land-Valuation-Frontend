import Card from '@/Common_Pages/components/ui/Card'
import { formatDate } from '@/Role_Pages/coordinator/project-status/api/project-status'
import type { ProjectRow } from '@/Role_Pages/coordinator/project-status/types/project-status'

// The list of matching projects. Clicking one opens its valuations.
type ProjectListProps = {
  projects: ProjectRow[]
  loading: boolean
  searched: boolean
  onOpen: (project: ProjectRow) => void
}

const ProjectList = ({ projects, loading, searched, onOpen }: ProjectListProps) => {
  if (loading) {
    return <p className="text-center text-sm text-emerald-200">Loading projects…</p>
  }

  if (searched && projects.length === 0) {
    return (
      <Card className="mx-auto max-w-3xl p-8 text-center">
        <p className="font-semibold text-accent-200">No projects found</p>
        <p className="mt-1 text-sm text-emerald-100">
          No project matches that NIC or Project ID.
        </p>
      </Card>
    )
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-3">
      {projects.map((p) => (
        <button
          key={p.projectId}
          type="button"
          onClick={() => onOpen(p)}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-accent-400/40 hover:bg-white/10"
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Property project</p>
            <p className="mt-1 flex items-center gap-2 font-semibold text-accent-300">
              {p.projectId}
              <span className="text-xs font-normal text-emerald-100">{p.propertyType || 'Bare Land'}</span>
            </p>
            <p className="mt-1 truncate text-sm text-emerald-50">{p.applicantName || 'Applicant'} <span className="text-emerald-100/60">· NIC {p.nic}</span></p>
            <p className="mt-0.5 truncate text-xs text-emerald-100/65">{p.location || 'Property location not provided'}</p>
            <p className="mt-0.5 text-xs text-emerald-200">
              Created {formatDate(p.createdAt)} · {p.valuationCount} valuation{p.valuationCount === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-xs font-semibold text-emerald-50">{p.valuationStatus || p.status}</p><p className="mt-1 text-xs text-emerald-100/55">{p.technicalOfficerId ? `Officer ${p.technicalOfficerId}` : 'Officer not assigned'}</p></div>
            <span className="text-emerald-200 transition group-hover:translate-x-0.5 group-hover:text-accent-300">
              →
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

export default ProjectList
