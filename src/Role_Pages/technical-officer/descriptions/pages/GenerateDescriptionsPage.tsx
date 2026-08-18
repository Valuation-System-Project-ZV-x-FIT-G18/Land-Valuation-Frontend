//06
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import DescriptionsEditor from '@/Role_Pages/technical-officer/descriptions/components/DescriptionsEditor'
import { getCompletedProjects } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import TOWorkflowStepper from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import { loadWorkflowSelection, saveWorkflowSelection } from '@/Role_Pages/technical-officer/assignments/utils/workflowSelection'

// Technical Officer > Generate Descriptions.
// Projects → valuations → generate/edit that project's report descriptions.
const GenerateDescriptionsPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const routedSelection = location.state as { assignment?: Assignment; projectId?: string } | null
  const storedSelection = loadWorkflowSelection(toId)
  const [completed, setCompleted] = useState<string[]>([])
  const [selected, setSelected] = useState<Assignment | null>(() => routedSelection?.assignment ?? storedSelection?.assignment ?? null)
  const [directProjectId, setDirectProjectId] = useState(() => routedSelection?.projectId ?? storedSelection?.projectId ?? '')

  const loadCompleted = () => getCompletedProjects().then(setCompleted)
  useEffect(() => {
    loadCompleted()
  }, [])

  useEffect(() => {
    const projectId = selected?.projectId ?? directProjectId
    if (toId && projectId) saveWorkflowSelection(toId, { assignment: selected ?? undefined, projectId })
  }, [directProjectId, selected, toId])

  if (selected || directProjectId) {
    return (
      <DescriptionsEditor
        projectId={selected?.projectId ?? directProjectId}
        onContinueToDraft={selected
          ? () => navigate('/technical-officer/draft', { state: { assignment: selected } })
          : undefined}
        onBack={() => {
          setSelected(null)
          setDirectProjectId('')
          loadCompleted() // refresh the "✓ Saved" badge
        }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <TOWorkflowStepper current="descriptions" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Generate <GradientText>Descriptions</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Choose a project, then a valuation, to generate or edit its descriptions.
        </p>
      </div>
      <ProjectValuationPicker toId={toId} actionLabel="Generate →" onSelect={setSelected} completed={completed} />
    </div>
  )
}

export default GenerateDescriptionsPage
