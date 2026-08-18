import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import NearbyAnalyser from '@/Role_Pages/technical-officer/nearby/components/NearbyAnalyser'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import { useWorkflowProject } from '@/Role_Pages/technical-officer/shared/useWorkflowProject'

const NEARBY_STORAGE_KEY = 'technical-officer-nearby-project'

// Technical Officer > Analyse Nearby Lands.
// Projects → valuations → analyse comparable land values for that project.
const NearbyAnalysisPage = () => {
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const { projectId, selectProject } = useWorkflowProject(NEARBY_STORAGE_KEY)

  if (projectId) {
    return <NearbyAnalyser projectId={projectId} onBack={() => selectProject(null)} />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Analyse <GradientText>Nearby Lands</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Choose a project, then a valuation, to review nearby land prices and build its evidence.
        </p>
      </div>
      <ProjectValuationPicker
        toId={toId}
        actionLabel="Analyse →"
        persistenceKey={NEARBY_STORAGE_KEY}
        onSelect={(assignment) => selectProject(assignment.projectId)}
      />
    </div>
  )
}

export default NearbyAnalysisPage
