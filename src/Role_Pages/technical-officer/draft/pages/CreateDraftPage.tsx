//03
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import DraftEditor from '@/Role_Pages/technical-officer/draft/components/DraftEditor'

const isReadyForDraft = (assignment: Assignment) =>
  (assignment.status === 'Assignment Accepted' && assignment.reviewStatus !== 'rejected_to_to') ||
  assignment.status === 'Draft Submitted' ||
  ['pending_l3', 'pending_l2', 'pending_l1', 'locked'].includes(assignment.reviewStatus)

const isSubmittedDraft = (assignment: Assignment) =>
  assignment.status === 'Draft Submitted' ||
  ['pending_l3', 'pending_l2', 'pending_l1', 'locked'].includes(assignment.reviewStatus)

const CreateDraftPage = () => {
  const location = useLocation()
  const { user } = useAuth()
  const [selected, setSelected] = useState<Assignment | null>(
    () => (location.state as { assignment?: Assignment } | null)?.assignment ?? null,
  )
  if (selected) return (
    <DraftEditor
      projectId={selected.projectId}
      valuationId={selected.valuationId}
      readOnly={isSubmittedDraft(selected)}
      reviewStatus={selected.reviewStatus}
      onBack={() => setSelected(null)}
    />
  )
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">Create <GradientText>Draft</GradientText></h1>
        <p className="mx-auto mt-2 max-w-xl text-emerald-100/70">Create reports for active projects and revisit submitted drafts while they move through manager review.</p>
      </div>
      <ProjectValuationPicker
        toId={user?.userId ?? ''}
        actionLabel="Open draft"
        onSelect={setSelected}
        statusFilter={isReadyForDraft}
        emptyText="Draft-ready and previously submitted projects will appear here."
        persistenceKey={`to-create-draft:${user?.userId ?? ''}`}
      />
    </div>
  )
}

export default CreateDraftPage
