import Card from '@/Common_Pages/components/ui/Card'
import StatusBadge from '@/Role_Pages/coordinator/project-status/components/StatusBadge'
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
    return <p className="text-center text-sm text-emerald-200/60">Loading projects…</p>
  }

  if (searched && projects.length === 0) {
    return (
      <Card className="mx-auto max-w-2xl p-8 text-center">
        <p className="font-semibold text-gold-200">No projects found</p>
        <p className="mt-1 text-sm text-emerald-100/70">
          No project matches that NIC or Project ID.
        </p>
      </Card>
    )
  }

  return (
    <div className="mx-auto grid max-w-3xl gap-3">
      {projects.map((p) => (
        <button
          key={p.projectId}
          type="button"
          onClick={() => onOpen(p)}
          className="group flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-gold-400/40 hover:bg-white/10"
        >
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-semibold text-gold-300">
              {p.projectId}
              <span className="text-xs font-normal text-emerald-200/50">
                {p.propertyType || 'Property'}
              </span>
            </p>
            <p className="mt-1 truncate text-sm text-emerald-100/80">NIC {p.nic}</p>
            <p className="mt-0.5 text-xs text-emerald-200/50">
              Created {formatDate(p.createdAt)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <StatusBadge status={p.status} />
            <span className="text-emerald-200/40 transition group-hover:translate-x-0.5 group-hover:text-gold-300">
              →
            </span>
          </div>
        </button>
      ))}
    </div>
  )
}

export default ProjectList
