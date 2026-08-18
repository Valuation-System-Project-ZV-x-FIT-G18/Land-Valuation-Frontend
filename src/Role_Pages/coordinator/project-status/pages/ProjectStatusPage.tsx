import { useEffect, useState } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import ProjectSearchBar from '@/Role_Pages/coordinator/project-status/components/ProjectSearchBar'
import type { SearchMode } from '@/Role_Pages/coordinator/project-status/components/ProjectSearchBar'
import ProjectList from '@/Role_Pages/coordinator/project-status/components/ProjectList'
import ValuationList from '@/Role_Pages/coordinator/project-status/components/ValuationList'
import StatusDetail from '@/Role_Pages/coordinator/project-status/components/StatusDetail'
import ProjectDetailsView from '@/Role_Pages/coordinator/project-status/components/ProjectDetailsView'
import StatusTimeline, { type TimelineStep } from '@/Role_Pages/coordinator/project-status/components/StatusTimeline'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import {
  searchProjects,
  listValuations,
  getValuationStatus,
  getProjectTimeline,
} from '@/Role_Pages/coordinator/project-status/api/project-status'
import type {
  ProjectRow,
  ValuationRow,
  StatusDetail as StatusDetailType,
} from '@/Role_Pages/coordinator/project-status/types/project-status'

// Coordinator > Project Status.
// Drill-down: search projects -> open a project's valuations -> view status.
const ProjectStatusPage = () => {
  const { user } = useAuth()
  // A loan applicant only ever sees their own projects (their user_id is their NIC),
  // so no search bar is shown for them.
  const isApplicant = user?.role === 'Loan Applicant'
  const isBank = user?.role === 'Bank'
  const canViewFullDetails = user?.role === 'Coordinator'
  const [mode, setMode] = useState<SearchMode>('nic')
  const [query, setQuery] = useState('')
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')

  // Drill-down selections (null = show the previous level).
  const [project, setProject] = useState<ProjectRow | null>(null)
  const [valuations, setValuations] = useState<ValuationRow[]>([])
  const [loadingVals, setLoadingVals] = useState(false)
  const [status, setStatus] = useState<StatusDetailType | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [projectSteps, setProjectSteps] = useState<TimelineStep[]>([])

  // Load every project once; filtering then happens live in the browser.
  const load = async () => {
    setLoading(true)
    setError('')
    const res = await searchProjects('')
    setProjects(res.projects)
    if (res.error) setError(res.error)
    setLoading(false)
    setSearched(true)
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // A loan applicant only sees their own projects; staff can search all.
  const q = query.trim().toLowerCase()
  const filtered = isApplicant
    ? projects.filter((p) => p.nic === user?.userId)
    : q === ''
      ? projects
      : projects.filter((p) =>
          (mode === 'nic' ? p.nic : p.projectId).toLowerCase().includes(q),
        )

  // Open a project -> load its valuations + the project-level status timeline.
  const openProject = async (p: ProjectRow) => {
    setProject(p)
    setStatus(null)
    setError('')
    setLoadingVals(true)
    setProjectSteps([])
    getProjectTimeline(p.projectId).then(setProjectSteps)
    const res = await listValuations(p.projectId)
    setValuations(res.valuations)
    if (res.error) setError(res.error)
    setLoadingVals(false)
  }

  // Open a valuation -> load its status detail (by its unique row id).
  const openStatus = async (v: ValuationRow) => {
    setError('')
    const res = await getValuationStatus(v.rowId)
    if (res.status) setStatus(res.status)
    else setError(res.error ?? 'Could not load the status.')
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Project <GradientText>Status</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          {isApplicant
            ? 'Your projects — open one to see its valuations and status.'
            : isBank
              ? 'Valuation requests associated with your bank branch.'
            : 'Search by NIC or Project ID, open a project to see its valuations, then view the status.'}
        </p>
      </div>

      {error && (
        <p className="mx-auto max-w-2xl rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-sm text-red-200">
          {error}
        </p>
      )}

      {showDetails && project ? (
        // Full project details + documents.
        <ProjectDetailsView projectId={project.projectId} onBack={() => setShowDetails(false)} />
      ) : status ? (
        // Level 3: valuation status detail.
        <StatusDetail status={status} onBack={() => setStatus(null)} />
      ) : project ? (
        // Level 2: valuations for the selected project (+ view full details).
        <>
          {canViewFullDetails && <div className="text-center">
            <Button type="button" variant="outline" onClick={() => setShowDetails(true)} className="!px-5 !py-2 text-sm">
              📄 View full project details &amp; documents
            </Button>
          </div>}
          <ValuationList
            project={project}
            valuations={valuations}
            loading={loadingVals}
            onOpen={openStatus}
            onBack={() => setProject(null)}
          />
          {/* Project-level status timeline (works even with no valuations yet). */}
          {projectSteps.length > 0 && (
            <Card className="mx-auto max-w-2xl p-6 sm:p-8">
              <h4 className="mb-6 text-sm font-semibold uppercase tracking-wide text-emerald-200/50">
                Project Status
              </h4>
              <StatusTimeline steps={projectSteps} />
            </Card>
          )}
        </>
      ) : (
        // Level 1: (search for staff) + project list.
        <>
          {!isApplicant && (
            <ProjectSearchBar
              mode={mode}
              onModeChange={(m) => {
                setMode(m)
                setQuery('') // switching field clears the current filter
              }}
              value={query}
              onChange={setQuery}
            />
          )}
          <ProjectList
            projects={filtered}
            loading={loading}
            searched={searched}
            onOpen={openProject}
          />
        </>
      )}
    </div>
  )
}

export default ProjectStatusPage
