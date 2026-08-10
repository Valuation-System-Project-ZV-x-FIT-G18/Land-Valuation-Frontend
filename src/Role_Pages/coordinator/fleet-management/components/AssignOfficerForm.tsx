import { useEffect, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import FormField from '@/Common_Pages/components/ui/FormField'
import type {
  Officer,
  WorkProject,
  WorkValuation,
} from '@/Role_Pages/coordinator/fleet-management/types/fleet'
import { assignOfficer, searchWork } from '@/Role_Pages/coordinator/fleet-management/api/fleet'
import ValuationAssignRow from '@/Role_Pages/coordinator/fleet-management/components/ValuationAssignRow'

// Search-driven assign flow: search by NIC / Project ID → pick a project →
// pick a valuation → assign a technical officer (or see who already has it).
type Props = {
  officers: Officer[]
  onAssigned: () => void
  initialQuery?: string // e.g. NIC handed over from New Valuation
}

const AssignOfficerForm = ({ officers, onAssigned, initialQuery }: Props) => {
  const [q, setQ] = useState('')
  const [projects, setProjects] = useState<WorkProject[]>([])
  const [openProject, setOpenProject] = useState<string | null>(null)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [lastQuery, setLastQuery] = useState('')

  const runSearch = async (query: string) => {
    if (!query.trim()) {
      setError('Enter a NIC or Project ID.')
      return
    }
    setError('')
    setLoading(true)
    const res = await searchWork(query)
    setLoading(false)
    setProjects(res.projects)
    setSearched(true)
    setOpenProject(res.projects.length === 1 ? res.projects[0].projectId : null)
    setLastQuery(query)
    if (res.error) setError(res.error)
  }

  // Auto-run when a query is handed over (from the New Valuation flow).
  useEffect(() => {
    if (initialQuery) {
      setQ(initialQuery)
      runSearch(initialQuery)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery])

  const refresh = () => {
    onAssigned()
    if (lastQuery) runSearch(lastQuery)
  }

  const current = projects.find((p) => p.projectId === openProject)

  return (
    <Card className="p-6 sm:p-8">
      <h3 className="mb-1 text-lg font-bold text-white">Assign a Technical Officer</h3>
      <p className="mb-5 text-sm text-emerald-100/70">
        Search by NIC or Project ID, choose a project, then a valuation to assign.
      </p>

      {/* Search */}
      <form
        onSubmit={(e) => { e.preventDefault(); runSearch(q) }}
        className="flex flex-col gap-3 sm:flex-row sm:items-start"
      >
        <div className="flex-1">
          <FormField
            label="NIC or Project ID"
            name="workSearch"
            value={q}
            onChange={(e) => { setQ(e.target.value); setError('') }}
            placeholder="e.g. 200012345678 or pro001"
          />
        </div>
        <Button type="submit" disabled={loading} className="sm:mt-7">
          {loading ? 'Searching…' : 'Search'}
        </Button>
      </form>

      {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

      {searched && projects.length === 0 && !error && (
        <p className="mt-4 text-sm text-emerald-200/60">
          No projects found for that NIC or Project ID.
        </p>
      )}

      {/* Level 1 — projects */}
      {!openProject && projects.length > 0 && (
        <ul className="mt-5 divide-y divide-white/10 rounded-xl border border-white/10">
          {projects.map((p) => (
            <li key={p.projectId}>
              <button
                type="button"
                onClick={() => setOpenProject(p.projectId)}
                className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left text-sm transition hover:bg-white/5"
              >
                <span className="font-medium text-emerald-100">
                  Project <span className="text-gold-300">{p.projectId}</span>
                  {p.ownerName && <span className="text-emerald-200/60"> · {p.ownerName}</span>}
                </span>
                <span className="text-emerald-200/70">
                  {p.valuations.length} valuation{p.valuations.length === 1 ? '' : 's'} →
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Level 2 — valuations of the chosen project */}
      {openProject && current && (
        <div className="mt-5 space-y-3">
          <Button
            type="button"
            variant="outline"
            className="!px-5 !py-2 text-sm"
            onClick={() => setOpenProject(null)}
          >
            ← All projects
          </Button>
          <p className="text-sm font-medium text-emerald-100">
            Project <span className="text-gold-300">{current.projectId}</span>
            {current.ownerName && <span className="text-emerald-200/60"> · {current.ownerName}</span>}
          </p>

          {current.valuations.length === 0 ? (
            <p className="text-sm text-emerald-200/60">This project has no valuations yet.</p>
          ) : (
            <div className="space-y-3">
              {current.valuations.map((v: WorkValuation) => (
                <ValuationAssignRow
                  key={v.rowId}
                  valuation={v}
                  officers={officers}
                  onAssign={async (toId, date, time) => {
                    const res = await assignOfficer({ valuationRowId: v.rowId, toId, date, time })
                    if (res.ok) refresh()
                    return res
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  )
}

export default AssignOfficerForm
