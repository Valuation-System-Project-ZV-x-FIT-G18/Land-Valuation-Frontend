import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Modal from '@/Common_Pages/components/ui/Modal'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import AssignmentCard from '@/Role_Pages/technical-officer/assignments/components/AssignmentCard'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import { acceptAssignment, rejectAssignment } from '@/Role_Pages/coordinator/fleet-management/api/fleet'
import { getAssignments, type Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

// Technical Officer > Assigned Projects.
// Projects -> valuations -> the chosen valuation's full details.
const AssignedProjectsPage = () => {
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const [selected, setSelected] = useState<Assignment | null>(null)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [rejectOpen, setRejectOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectError, setRejectError] = useState('')
  const selectionKey = toId ? `to-assigned-project-selection:${toId}` : ''
  const projectKey = toId ? `to-assigned-project-open:${toId}` : ''

  useEffect(() => {
    if (!selectionKey || !toId) return
    let cancelled = false
    let savedAssignment: Assignment | null = null
    try {
      const saved = localStorage.getItem(selectionKey)
      if (saved) {
        savedAssignment = JSON.parse(saved) as Assignment
        setSelected(savedAssignment)
      }
    } catch {
      localStorage.removeItem(selectionKey)
    }

    const refreshSelection = async () => {
      if (!savedAssignment) return
      const result = await getAssignments(toId)
      if (cancelled || result.error) return
      const current = result.assignments.find(
        (assignment) => assignment.valuationRowId === savedAssignment?.valuationRowId,
      )
      if (current) {
        savedAssignment = current
        setSelected(current)
        localStorage.setItem(selectionKey, JSON.stringify(current))
      } else {
        savedAssignment = null
        setSelected(null)
        localStorage.removeItem(selectionKey)
      }
    }

    void refreshSelection()
    window.addEventListener('focus', refreshSelection)
    return () => {
      cancelled = true
      window.removeEventListener('focus', refreshSelection)
    }
  }, [selectionKey, toId])

  const selectAssignment = (assignment: Assignment) => {
    setMsg('')
    setSelected(assignment)
    if (selectionKey) localStorage.setItem(selectionKey, JSON.stringify(assignment))
  }

  const clearSelection = () => {
    setSelected(null)
    if (selectionKey) localStorage.removeItem(selectionKey)
  }

  const accept = async () => {
    if (!selected) return
    setBusy(true)
    const res = await acceptAssignment(selected.valuationRowId, toId)
    setBusy(false)
    if (res.ok) {
      const updated = { ...selected, status: 'Assignment Accepted' }
      setSelected(updated)
      if (selectionKey) localStorage.setItem(selectionKey, JSON.stringify(updated))
      setMsg('Assignment accepted.')
    } else {
      setMsg(res.error ?? 'Could not accept.')
    }
  }

  const openReject = () => {
    setRejectReason('')
    setRejectError('')
    setRejectOpen(true)
  }

  const closeReject = () => {
    if (busy) return
    setRejectOpen(false)
    setRejectReason('')
    setRejectError('')
  }

  const reject = async () => {
    if (!selected) return
    const reason = rejectReason.trim()
    if (!reason) return setRejectError('Please provide a reason for the coordinator.')
    if (reason.length < 10) return setRejectError('Please provide a little more detail (at least 10 characters).')
    setBusy(true)
    setRejectError('')
    const res = await rejectAssignment(selected.valuationRowId, toId, reason)
    setBusy(false)
    if (res.ok) {
      setRejectOpen(false)
      setRejectReason('')
      setMsg('Assignment rejected. It now awaits the coordinator acceptance.')
      clearSelection()
    } else {
      setRejectError(res.error ?? 'Could not reject the assignment. Please try again.')
    }
  }

  if (selected) {
    const isPending = selected.status === 'Technical Officer Assigned'
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button type="button" variant="outline" onClick={clearSelection} className="!px-5 !py-2.5 text-sm">
            Back to projects
          </Button>
          {isPending && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={busy}
                onClick={accept}
                className="!px-5 !py-2.5 text-sm"
              >
                {busy ? 'Accepting...' : 'Accept assignment'}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={openReject}
                className="!px-5 !py-2.5 text-sm !border-amber-400/50 !text-amber-200"
              >
                Reject assignment
              </Button>
            </div>
          )}
        </div>
        {msg && <p className="text-sm text-emerald-200">{msg}</p>}
        <AssignmentCard a={selected} />
        {selected.status === 'Assignment Accepted' && <Link
          to="/technical-officer/inspections"
          state={{ assignment: selected, projectId: selected.projectId }}
          className="flex items-center justify-between rounded-2xl border border-gold-400/30 bg-gold-400/10 px-5 py-4 font-semibold text-gold-200 transition hover:border-gold-400/60 hover:bg-gold-400/15"
        >
          <span><span className="mr-3 text-xs uppercase tracking-wider text-gold-300/65">Next step</span>Inspection Data</span>
          <span aria-hidden="true">→</span>
        </Link>}
        <Modal open={rejectOpen} onClose={closeReject} title="Reject assignment">
          <p className="text-sm leading-6 text-emerald-100/70">
            Explain why you cannot take this assignment. Your reason will be shared with the
            coordinator so they can reassign the project.
          </p>
          <div className="mt-5">
            <FormField
              label="Reason for rejection"
              name="assignment-rejection-reason"
              value={rejectReason}
              onChange={(event) => {
                setRejectReason(event.target.value)
                if (rejectError) setRejectError('')
              }}
              placeholder="For example: I am unavailable on the scheduled inspection date."
              textarea
              rows={4}
              error={rejectError}
            />
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={busy}
              onClick={closeReject}
              className="sm:min-w-28"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              loading={busy}
              onClick={reject}
              className="sm:min-w-44"
            >
              Confirm rejection
            </Button>
          </div>
        </Modal>
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
      <ProjectValuationPicker
        toId={toId}
        actionLabel="View details"
        onSelect={selectAssignment}
        persistenceKey={projectKey}
      />
    </div>
  )
}

export default AssignedProjectsPage
