import { useState } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import DraftEditor from '@/Role_Pages/technical-officer/draft/components/DraftEditor'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

// Technical Officer > Create Draft.
// Projects → valuations → assemble/edit that project's valuation report draft.
const CreateDraftPage = () => {
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const [selected, setSelected] = useState<Assignment | null>(null)

  if (selected) {
    return <DraftEditor projectId={selected.projectId} onBack={() => setSelected(null)} />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Create <GradientText>Draft</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Choose a project, then a valuation, to assemble its valuation report draft.
        </p>
      </div>
      <ProjectValuationPicker
        toId={toId}
        actionLabel="Create draft →"
        onSelect={setSelected}
        // Hide anything already submitted / in review / locked / sent back
        // (sent-back ones live under "Corrections").
        statusFilter={(a) =>
          !['pending_l3', 'pending_l2', 'pending_l1', 'locked', 'rejected_to_to'].includes(a.reviewStatus)
        }
        emptyText="No projects need a draft right now. Submitted and finalised ones move out of this list."
      />
    </div>
  )
}

export default CreateDraftPage
