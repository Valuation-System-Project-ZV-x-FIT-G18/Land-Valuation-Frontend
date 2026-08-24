import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import NearbyAnalyser from '@/Role_Pages/technical-officer/nearby/components/NearbyAnalyser'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import TOWorkflowStepper from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import { loadWorkflowSelection, saveWorkflowSelection } from '@/Role_Pages/technical-officer/assignments/utils/workflowSelection'
import WorkflowPreviewLayout from '@/Role_Pages/technical-officer/shared/WorkflowPreviewLayout'
import type { Evidence, Valuation } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

const NearbyAnalysisPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const routedSelection = location.state as { assignment?: Assignment; projectId?: string } | null
  const storedSelection = loadWorkflowSelection(toId)
  const [selected, setSelected] = useState<Assignment | null>(() =>
    routedSelection?.assignment ?? storedSelection?.assignment ?? null,
  )
  const [directProjectId, setDirectProjectId] = useState(() =>
    routedSelection?.projectId ?? storedSelection?.projectId ?? '',
  )
  const [previewVersion, setPreviewVersion] = useState(0)
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({})
  const [previewEvidence, setPreviewEvidence] = useState<Evidence | null>(null)
  const [previewValuation, setPreviewValuation] = useState<Valuation | null>(null)

  useEffect(() => {
    const projectId = selected?.projectId ?? directProjectId
    if (toId && projectId) saveWorkflowSelection(toId, { assignment: selected ?? undefined, projectId })
  }, [directProjectId, selected, toId])

  if (selected || directProjectId) {
    const projectId = selected?.projectId ?? directProjectId
    return (
      <WorkflowPreviewLayout projectId={projectId} refreshToken={previewVersion} valueOverrides={previewValues} evidenceOverride={previewEvidence} valuationOverride={previewValuation}>
      <NearbyAnalyser
        projectId={projectId}
        onContinue={() => navigate('/technical-officer/descriptions', {
          state: selected ? { assignment: selected } : { projectId: directProjectId },
        })}
        onBack={() => { setSelected(null); setDirectProjectId('') }}
        onDataSaved={() => setPreviewVersion((value) => value + 1)}
        onPreviewChange={(preview) => {
          setPreviewValues(preview.values)
          setPreviewEvidence(preview.evidence)
          setPreviewValuation(preview.valuation)
        }}
      />
      </WorkflowPreviewLayout>
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <TOWorkflowStepper current="nearby" />
      <div className="rounded-2xl border border-white/10 bg-emerald-950/40 px-6 py-8 text-center shadow-card backdrop-blur-sm sm:px-10 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300/75">Market comparison</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Find <GradientText>Nearby Lands</GradientText>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-emerald-100/65">
          Select a project to identify and rank the strongest nearby bare or residential land comparables by
          distance, recency, property type, extent and access.
        </p>
      </div>
      <ProjectValuationPicker
        toId={toId}
        actionLabel="Analyse lands →"
        projectActionLabel="Analyse lands →"
        directProjectSelection
        onSelect={setSelected}
      />
    </div>
  )
}

export default NearbyAnalysisPage
