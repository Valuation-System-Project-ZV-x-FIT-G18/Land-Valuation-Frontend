import { useCallback, useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import {
  getLeaves, markLeave, removeLeave, type LeaveEntry,
} from '@/Role_Pages/coordinator/fleet-management/api/fleet'

// Technical Officer > Attendance (self-service).
// The officer marks the day(s) they won't come in. On that day they move to the
// "On Leave" list in Fleet Management and are not offered for assignment.
const TOAttendancePage = () => {
  const { user } = useAuth()
  const toId = user?.userId ?? ''

  const now = new Date()
  const today = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10)
  const [leaves, setLeaves] = useState<LeaveEntry[]>([])
  const [date, setDate] = useState(today)
  const [reason, setReason] = useState('')
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const load = useCallback(() => {
    if (toId) getLeaves(toId).then(setLeaves)
  }, [toId])
  useEffect(() => { load() }, [load])

  const submit = async () => {
    if (!date) return setError('Pick a date.')
    if (date < today) return setError('Leave date cannot be before today.')
    if (leaves.some((leave) => leave.date === date)) {
      return setError('You have already marked leave for this date.')
    }
    setError(''); setNotice('')
    const res = await markLeave(toId, reason, date)
    if (res.ok) { setNotice('Marked. You will be shown as on leave that day.'); setReason(''); load() }
    else setError(res.error ?? 'Could not mark your leave.')
  }

  const remove = async (id: number) => {
    const res = await removeLeave(id)
    if (res.ok) { setNotice('Leave removed — you are available that day.'); load() }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SuccessModal
        open={!!notice}
        title="Attendance Updated"
        message={notice}
        closeLabel="Done"
        onClose={() => setNotice('')}
      />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          My <GradientText>Attendance</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Mark the days you won’t come in. On that day you’re shown as on leave and won’t be
          assigned new work. (e.g. mark today that you won’t come tomorrow.)
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <h3 className="mb-4 text-sm font-semibold text-gold-300">🗓️ Mark a leave day</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField label="Leave date" name="date" type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="sm:col-span-2">
            <FormField label="Reason" name="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Personal leave" />
          </div>
        </div>
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        <Button type="button" fullWidth className="mt-4" onClick={submit}>Mark my Leave</Button>
      </Card>

      <Card className="p-6 sm:p-8">
        <h3 className="mb-3 text-sm font-semibold text-gold-300">My today &amp; upcoming leaves</h3>
        {leaves.length === 0 ? (
          <p className="text-sm text-emerald-100/60">You have no leaves marked.</p>
        ) : (
          <ul className="divide-y divide-white/10">
            {leaves.map((l) => (
              <li key={l.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                <span className="text-emerald-100">
                  <b className="text-gold-300">{l.date || 'ongoing'}</b> · <span className="text-amber-200/90">{l.reason}</span>
                </span>
                <button type="button" onClick={() => remove(l.id)} className="rounded-lg border border-white/15 px-3 py-1 text-xs text-emerald-200/70 transition hover:border-red-400/50 hover:text-red-300">
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default TOAttendancePage
