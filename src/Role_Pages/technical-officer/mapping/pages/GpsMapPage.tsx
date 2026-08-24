import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import MapWorkspace from '@/Role_Pages/technical-officer/mapping/components/MapWorkspace'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import TOWorkflowStepper from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import { loadWorkflowSelection, saveWorkflowSelection } from '@/Role_Pages/technical-officer/assignments/utils/workflowSelection'
import WorkflowPreviewLayout from '@/Role_Pages/technical-officer/shared/WorkflowPreviewLayout'

// Technical Officer > GPS & Map Integration.
// Projects → valuations → pin the location & build map/access info.
const GpsMapPage = () => {
  const location = useLocation()
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const routedSelection = location.state as { assignment?: Assignment; projectId?: string } | null
  const storedSelection = loadWorkflowSelection(toId)
  const [selected, setSelected] = useState<Assignment | null>(() => routedSelection?.assignment ?? storedSelection?.assignment ?? null)
  const [directProjectId, setDirectProjectId] = useState(() => routedSelection?.projectId ?? storedSelection?.projectId ?? '')
  const [previewVersion, setPreviewVersion] = useState(0)
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({})

  useEffect(() => {
    const projectId = selected?.projectId ?? directProjectId
    if (toId && projectId) saveWorkflowSelection(toId, { assignment: selected ?? undefined, projectId })
  }, [directProjectId, selected, toId])

  if (selected || directProjectId) {
    const projectId = selected?.projectId ?? directProjectId
    return <WorkflowPreviewLayout projectId={projectId} refreshToken={previewVersion} valueOverrides={previewValues}>
      <MapWorkspace projectId={projectId} onBack={() => { setSelected(null); setDirectProjectId('') }} onDataSaved={() => setPreviewVersion((value) => value + 1)} onPreviewChange={setPreviewValues} />
    </WorkflowPreviewLayout>
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <TOWorkflowStepper current="gps" />
      <div className="rounded-2xl border border-white/10 bg-emerald-950/40 px-6 py-8 text-center shadow-card backdrop-blur-sm sm:px-10 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300/75">Technical Officer Workspace</p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          GPS &amp; <GradientText>Map Integration</GradientText>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-emerald-100/65 sm:text-base">
          Select an assigned project to verify its exact position, review satellite imagery, and prepare professional access and locality notes.
        </p>
      </div>
      <ProjectValuationPicker
        toId={toId}
        actionLabel="Open map →"
        projectActionLabel="Open map →"
        directProjectSelection
        onSelect={setSelected}
      />
    </div>
  )
}

export default GpsMapPage
