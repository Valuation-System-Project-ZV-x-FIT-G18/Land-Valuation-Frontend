import { useState } from 'react'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import DraftEditor from '@/Role_Pages/technical-officer/draft/components/DraftEditor'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

// Technical Officer > Rejected Draft Report.
// Drafts a manager sent back (review_status = 'rejected_to_to'). The officer
// opens one, sees the reason, fixes the report, and re-submits for the L3 check.
const TOCorrectionsPage = () => {
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
          <GradientText>Rejected Draft Report</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Rejected draft reports sent back to you to fix. Open one, correct it, then save &amp; re-submit for the L3 check.
        </p>
      </div>
      <ProjectValuationPicker
        toId={toId}
        actionLabel="Fix draft →"
        onSelect={setSelected}
        statusFilter={(a) => a.reviewStatus === 'rejected_to_to'}
        emptyText="Nothing to fix — rejected draft reports sent back to you will appear here."
      />
    </div>
  )
}

export default TOCorrectionsPage
