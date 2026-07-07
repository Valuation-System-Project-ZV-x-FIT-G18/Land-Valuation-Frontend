import { useState } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import NearbyAnalyser from '@/Role_Pages/technical-officer/nearby/components/NearbyAnalyser'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

// Technical Officer > Analyse Nearby Lands.
// Projects → valuations → analyse comparable land values for that project.
const NearbyAnalysisPage = () => {
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const [selected, setSelected] = useState<Assignment | null>(null)

  if (selected) {
    return <NearbyAnalyser projectId={selected.projectId} onBack={() => setSelected(null)} />
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
      <ProjectValuationPicker toId={toId} actionLabel="Analyse →" onSelect={setSelected} />
    </div>
  )
}

export default NearbyAnalysisPage
