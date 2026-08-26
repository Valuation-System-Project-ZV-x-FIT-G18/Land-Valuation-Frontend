import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import ProjectSearchBar from '@/Role_Pages/coordinator/project-status/components/ProjectSearchBar'
import type { SearchMode } from '@/Role_Pages/coordinator/project-status/components/ProjectSearchBar'
import ProjectList from '@/Role_Pages/coordinator/project-status/components/ProjectList'
import ValuationList from '@/Role_Pages/coordinator/project-status/components/ValuationList'
import StatusDetail from '@/Role_Pages/coordinator/project-status/components/StatusDetail'
import ProjectDetailsView from '@/Role_Pages/coordinator/project-status/components/ProjectDetailsView'
import Button from '@/Common_Pages/components/ui/Button'
import {
  searchProjects,
  listValuations,
  getValuationStatus,
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
  const navigate = useNavigate()
  const location = useLocation()
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
    const res = await listValuations(p.projectId)
    setValuations(res.valuations)
    if (res.error) setError(res.error)
    setLoadingVals(false)
  }

  // Another page can hand this one either a whole project (open it straight
  // away) or a search term (land on the list, already filtered). The Valuations
  // page uses the latter so "Open project" does not make the coordinator retype
  // a project id they were already looking at.
  useEffect(() => {
    const incoming = (location.state as { project?: ProjectRow; query?: string } | null)
    if (incoming?.project) void openProject(incoming.project)
    else if (incoming?.query) {
      setMode('project')
      setQuery(incoming.query)
    } else return
    navigate(location.pathname, { replace: true })
    // Consume navigation state once only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Open a valuation -> load its status detail (by its unique row id).
  const openStatus = async (v: ValuationRow) => {
    setError('')
    const res = await getValuationStatus(v.rowId)
    if (res.status) setStatus(res.status)
    else setError(res.error ?? 'Could not load the status.')
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {canViewFullDetails ? <><GradientText>Projects</GradientText></> : <>Project <GradientText>Status</GradientText></>}
        </h1>
        <p className="mt-2 max-w-xl text-emerald-100">
          {isApplicant
            ? 'Your projects — open one to see its valuations and status.'
            : isBank
              ? 'Valuation requests associated with your bank branch.'
            : 'Each project represents one property. Open it to view its initial valuation and revaluations.'}
        </p>
        </div>
        {canViewFullDetails && !project && <Button type="button" onClick={() => navigate('/coordinator/projects/new')} className="!px-5 !py-2.5 text-sm">+ New Project</Button>}
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
              View full project details &amp; documents
            </Button>
          </div>}
          <ValuationList
            project={project}
            valuations={valuations}
            loading={loadingVals}
            onOpen={openStatus}
            onAddValuation={canViewFullDetails ? () => navigate('/coordinator/valuations/new', {
              state: {
                projectId: project.projectId,
                nic: project.nic,
                previousValuationRowId: valuations.length
                  ? valuations[valuations.length - 1].rowId
                  : undefined,
              },
            }) : undefined}
            onBack={() => setProject(null)}
          />
        </>
      ) : (
        // Level 1: (search for staff) + project list, with the create action.
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
