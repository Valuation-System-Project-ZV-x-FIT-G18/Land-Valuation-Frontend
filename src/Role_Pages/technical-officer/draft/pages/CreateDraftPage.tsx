import { useState } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import DraftEditor from '@/Role_Pages/technical-officer/draft/components/DraftEditor'

const isReadyForDraft = (assignment: Assignment) =>
  assignment.status === 'Assignment Accepted' && assignment.reviewStatus !== 'rejected_to_to'

const CreateDraftPage = () => {
  const { user } = useAuth()
  const [selected, setSelected] = useState<Assignment | null>(null)
  if (selected) return <DraftEditor projectId={selected.projectId} valuationId={selected.valuationId} onBack={() => setSelected(null)} />
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Create <GradientText>Draft</GradientText></h1>
        <p className="mx-auto mt-2 max-w-xl text-emerald-100/70">Select a project to collect its saved information, review the editable report and generate the Word document.</p>
      </div>
      <ProjectValuationPicker
        toId={user?.userId ?? ''}
        actionLabel="Create draft"
        onSelect={setSelected}
        statusFilter={isReadyForDraft}
        emptyText="Accepted projects ready for drafting will appear here."
        persistenceKey={`to-create-draft:${user?.userId ?? ''}`}
      />
    </div>
  )
}

export default CreateDraftPage
