import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import Table from '@/Common_Pages/components/ui/Table'
import {
  approveLeave,
  getLeaves,
  rejectLeave,
  type LeaveEntry,
  type LeaveStatus,
} from '@/Role_Pages/coordinator/fleet-management/api/fleet'

const statusClass: Record<LeaveStatus, string> = {
  Pending: 'border-amber-400/35 bg-amber-400/10 text-amber-200',
  Approved: 'border-emerald-400/35 bg-emerald-400/10 text-emerald-200',
  Rejected: 'border-red-400/35 bg-red-400/10 text-red-200',
}

const Badge = ({ status }: { status: LeaveStatus }) => (
  <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass[status]}`}>
    {status}
  </span>
)

const TOAttendanceReviewPage = () => {
  const navigate = useNavigate()
  const [leaves, setLeaves] = useState<LeaveEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    getLeaves()
      .then((rows) => setLeaves(rows))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const review = async (id: number, action: 'approve' | 'reject') => {
    setError('')
    const res = action === 'approve' ? await approveLeave(id) : await rejectLeave(id)
    if (!res.ok) return setError(res.error ?? 'Could not update leave request.')
    setNotice(action === 'approve' ? 'Leave request approved.' : 'Leave request rejected.')
    load()
  }

  const pending = useMemo(() => leaves.filter((l) => l.status === 'Pending'), [leaves])
  const history = useMemo(() => leaves.filter((l) => l.status !== 'Pending'), [leaves])

  const rows = (items: LeaveEntry[], withActions: boolean) =>
    items.map((l) => [
      l.name,
      l.toId,
      l.date,
      l.reason,
      <Badge key={`status-${l.id}`} status={l.status} />,
      ...(withActions
        ? [
            <div key={`actions-${l.id}`} className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => review(l.id, 'approve')}
                className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={() => review(l.id, 'reject')}
                className="rounded-lg border border-red-400/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200 transition hover:bg-red-500/20"
              >
                Reject
              </button>
            </div>,
          ]
        : []),
    ])

  return (
    <div className="space-y-6">
      <SuccessModal
        open={!!notice}
        title="Attendance Updated"
        message={notice}
        closeLabel="Done"
        onClose={() => setNotice('')}
      />
      <div className="text-center">
        <p className="mx-auto mt-2 max-w-xl text-sm text-emerald-100">
          Leave requests stay pending until accepted. Only accepted requests move officers to On Leave on that day.
        </p>
      </div>

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-center text-sm text-red-200">
          {error}
        </p>
      )}

      <Card className="p-5 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          Pending Requests
          <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-emerald-100">
            {pending.length}
          </span>
        </h3>
        {loading ? (
          <p className="text-sm text-emerald-100">Loading requests...</p>
        ) : (
          <Table
            columns={['Officer', 'ID', 'Date', 'Reason', 'Status', 'Action']}
            rows={rows(pending, true)}
            emptyText="No pending leave requests."
          />
        )}
      </Card>

      <Card className="p-5 sm:p-6">
        <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
          Reviewed Requests
          <span className="ml-1 rounded-full bg-white/10 px-2 py-0.5 text-xs font-medium text-emerald-100">
            {history.length}
          </span>
        </h3>
        <Table
          columns={['Officer', 'ID', 'Date', 'Reason', 'Status']}
          rows={rows(history, false)}
          emptyText="No reviewed leave requests."
        />
      </Card>
    </div>
  )
}

export default TOAttendanceReviewPage
