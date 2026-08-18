import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import InspectionForm from '@/Role_Pages/technical-officer/inspections/components/InspectionForm'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import TOWorkflowStepper from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

// Technical Officer > Inspection Data.
// Projects → valuations → OCR upload + inspection form for that project.
const InspectionDataPage = () => {
  const location = useLocation()
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const [selected, setSelected] = useState<Assignment | null>(() => (location.state as { assignment?: Assignment } | null)?.assignment ?? null)

  if (selected) {
    return (
      <div className="mx-auto max-w-3xl">
        <InspectionForm projectId={selected.projectId} toId={toId} onBack={() => setSelected(null)} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <TOWorkflowStepper current="inspection" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Inspection <GradientText>Data</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Choose a project, then a valuation, to record its site inspection.
        </p>
      </div>
      <ProjectValuationPicker toId={toId} actionLabel="Add Inspection →" onSelect={setSelected} />
    </div>
  )
}

export default InspectionDataPage
