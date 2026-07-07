import { useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import AssignmentCard from '@/Role_Pages/technical-officer/assignments/components/AssignmentCard'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import { rejectAssignment } from '@/Role_Pages/coordinator/fleet-management/api/fleet'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

// Technical Officer > Assigned Projects.
// Projects → valuations → the chosen valuation's full details.
const AssignedProjectsPage = () => {
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const [selected, setSelected] = useState<Assignment | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  const reject = async () => {
    if (!selected) return
    const reason = window.prompt('Why are you rejecting this assignment?', '')
    if (reason === null) return
    setBusy(true)
    const res = await rejectAssignment(selected.valuationRowId, toId, reason)
    setBusy(false)
    if (res.ok) {
      setMsg('Assignment rejected. It now awaits the coordinator’s acceptance.')
      setSelected(null)
    } else {
      setMsg(res.error ?? 'Could not reject.')
    }
  }

  if (selected) {
    const isAssigned = selected.status === 'Technical Officer Assigned'
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={() => setSelected(null)} className="!px-5 !py-2.5 text-sm">
            ← Back to projects
          </Button>
          {isAssigned && (
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={reject}
              className="!px-5 !py-2.5 text-sm !border-amber-400/50 !text-amber-200"
            >
              {busy ? 'Rejecting…' : '✖ Reject assignment'}
            </Button>
          )}
        </div>
        <AssignmentCard a={selected} />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Assigned <GradientText>Projects</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Choose a project, then a valuation, to view its location, schedule and owner details.
        </p>
      </div>
      {msg && <p className="text-center text-sm text-emerald-200">{msg}</p>}
      <ProjectValuationPicker toId={toId} actionLabel="View details →" onSelect={setSelected} />
    </div>
  )
}

export default AssignedProjectsPage
