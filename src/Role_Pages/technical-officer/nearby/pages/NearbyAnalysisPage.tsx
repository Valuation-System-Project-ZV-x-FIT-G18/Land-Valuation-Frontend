import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import NearbyAnalyser from '@/Role_Pages/technical-officer/nearby/components/NearbyAnalyser'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import TOWorkflowStepper from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

const NearbyAnalysisPage = () => {
  const location = useLocation()
  const { user } = useAuth()
  const [selected, setSelected] = useState<Assignment | null>(() =>
    (location.state as { assignment?: Assignment } | null)?.assignment ?? null,
  )
  const [directProjectId, setDirectProjectId] = useState(() =>
    (location.state as { projectId?: string } | null)?.projectId ?? '',
  )

  if (selected || directProjectId) {
    return (
      <NearbyAnalyser
        projectId={selected?.projectId ?? directProjectId}
        onBack={() => { setSelected(null); setDirectProjectId('') }}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <TOWorkflowStepper current="nearby" />
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300/75">Market comparison</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Find <GradientText>Nearby Lands</GradientText>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-emerald-100/65">
          Select a project to identify and rank the strongest nearby bare or residential land comparables by
          distance, recency, property type, extent and access.
        </p>
      </div>
      <ProjectValuationPicker toId={user?.userId ?? ''} actionLabel="Find suitable lands →" onSelect={setSelected} />
    </div>
  )
}

export default NearbyAnalysisPage
