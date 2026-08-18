import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import MapWorkspace from '@/Role_Pages/technical-officer/mapping/components/MapWorkspace'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import { useWorkflowProject } from '@/Role_Pages/technical-officer/shared/useWorkflowProject'

const GPS_MAP_STORAGE_KEY = 'technical-officer-gps-map-project'

// Technical Officer > GPS & Map Integration.
// Projects → valuations → pin the location & build map/access info.
const GpsMapPage = () => {
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const { projectId: selectedProjectId, selectProject } = useWorkflowProject(GPS_MAP_STORAGE_KEY)

  if (selectedProjectId) {
    return <MapWorkspace projectId={selectedProjectId} onBack={() => selectProject(null)} />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          GPS &amp; <GradientText>Map Integration</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Choose a project, then a valuation, to pin its location and generate map &amp; access details.
        </p>
      </div>
      <ProjectValuationPicker
        toId={toId}
        actionLabel="Open map →"
        persistenceKey={GPS_MAP_STORAGE_KEY}
        onSelect={(assignment) => selectProject(assignment.projectId)}
      />
    </div>
  )
}

export default GpsMapPage
