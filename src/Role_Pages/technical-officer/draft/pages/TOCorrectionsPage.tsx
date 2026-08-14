import { useState } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import DraftEditor from '@/Role_Pages/technical-officer/draft/components/DraftEditor'

const needsCorrection = (assignment: Assignment) =>
  assignment.status === 'rejected_to_to' || assignment.reviewStatus === 'rejected_to_to'

const TOCorrectionsPage = () => {
  const { user } = useAuth()
  const [selected, setSelected] = useState<Assignment | null>(null)

  if (selected) {
    return (
      <DraftEditor
        projectId={selected.projectId}
        valuationId={selected.valuationId}
        rejectReason={selected.rejectReason}
        correctionMode
        onBack={() => setSelected(null)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Draft <GradientText>Corrections</GradientText></h1>
        <p className="mx-auto mt-2 max-w-xl text-emerald-100/70">Reports returned by Manager L3 appear here with the correction reason. Update and resubmit them for review.</p>
      </div>
      <ProjectValuationPicker
        toId={user?.userId ?? ''}
        actionLabel="Open correction"
        onSelect={setSelected}
        statusFilter={needsCorrection}
        emptyText="Reports returned by Manager L3 will appear here."
        persistenceKey={`to-draft-corrections:${user?.userId ?? ''}`}
      />
    </div>
  )
}

export default TOCorrectionsPage
