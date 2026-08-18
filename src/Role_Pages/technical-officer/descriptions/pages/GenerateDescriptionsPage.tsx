import { useEffect, useState } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import DescriptionsEditor from '@/Role_Pages/technical-officer/descriptions/components/DescriptionsEditor'
import { getCompletedProjects } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import { useWorkflowProject } from '@/Role_Pages/technical-officer/shared/useWorkflowProject'

const DESCRIPTIONS_STORAGE_KEY = 'technical-officer-descriptions-project'

// Technical Officer > Generate Descriptions.
// Projects → valuations → generate/edit that project's report descriptions.
const GenerateDescriptionsPage = () => {
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const [completed, setCompleted] = useState<string[]>([])
  const { projectId, selectProject } = useWorkflowProject(DESCRIPTIONS_STORAGE_KEY)

  const loadCompleted = () => getCompletedProjects().then(setCompleted)
  useEffect(() => {
    loadCompleted()
  }, [])

  if (projectId) {
    return (
      <DescriptionsEditor
        projectId={projectId}
        onBack={() => {
          selectProject(null)
          loadCompleted() // refresh the "✓ Saved" badge
        }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Generate <GradientText>Descriptions</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Choose a project, then a valuation, to generate or edit its descriptions.
        </p>
      </div>
      <ProjectValuationPicker
        toId={toId}
        actionLabel="Generate →"
        persistenceKey={DESCRIPTIONS_STORAGE_KEY}
        onSelect={(assignment) => selectProject(assignment.projectId)}
        completed={completed}
      />
    </div>
  )
}

export default GenerateDescriptionsPage
