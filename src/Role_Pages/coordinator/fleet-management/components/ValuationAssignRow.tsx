import { useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import FormField from '@/Common_Pages/components/ui/FormField'
import type { Officer, WorkValuation } from '@/Role_Pages/coordinator/fleet-management/types/fleet'

// One valuation inside a project. If a technical officer is already assigned it
// shows that assignment (with a "Change officer" option); otherwise it offers an
// inline "assign" form.
type Props = {
  valuation: WorkValuation
  officers: Officer[]
  onAssign: (toId: string, date: string, time: string) => Promise<{ ok: boolean; error?: string }>
}

const ValuationAssignRow = ({ valuation: v, officers, onAssign }: Props) => {
  const [open, setOpen] = useState(false)
  const [toId, setToId] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Open the form. When changing an existing assignment, pre-fill the current
  // officer, date and time so only what needs changing is edited.
  const openForm = () => {
    if (v.assigned) {
      setToId(v.officerId)
      setDate(v.date)
      setTime(v.time)
    }
    setError('')
    setOpen(true)
  }

  // When reassigning, the current officer isn't in the "available" pool, so add
  // them to the options too (marked "current") to keep them selectable.
  const officerOptions = [
    { value: '', label: officers.length ? 'Select an officer' : 'No officers free' },
    ...(v.assigned && !officers.some((o) => o.userId === v.officerId)
      ? [{ value: v.officerId, label: `${v.officerName} (${v.officerId}) · current` }]
      : []),
    ...officers.map((o) => ({ value: o.userId, label: `${o.name} (${o.userId}) · ${o.district}` })),
  ]

  const submit = async () => {
    if (!toId || !date || !time) {
      setError('Choose an officer, a date and a time.')
      return
    }
    setError('')
    setSubmitting(true)
    const res = await onAssign(toId, date, time)
    setSubmitting(false)
    if (!res.ok) setError(res.error ?? 'Could not assign.')
  }

  return (
    <div className="rounded-xl border border-white/10 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-medium text-emerald-100">
          Valuation <span className="text-gold-300">#{v.valuationId}</span>
          <span className="ml-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs capitalize text-emerald-200/80">
            {v.status.replace(/_/g, ' ')}
          </span>
        </span>

        <div className="flex items-center gap-2">
          {v.assigned && (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              ✓ Already assigned
            </span>
          )}
          {/* Assign (unassigned) or Change officer (assigned). */}
          <Button
            type="button"
            variant={open ? 'outline' : v.assigned ? 'outline' : 'primary'}
            className="!px-4 !py-2 text-sm"
            onClick={() => (open ? setOpen(false) : openForm())}
          >
            {open ? 'Cancel' : v.assigned ? 'Change officer' : 'Assign officer'}
          </Button>
        </div>
      </div>

      {/* Existing assignment details */}
      {v.assigned && (
        <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          <Info label="Assigned Officer" value={`${v.officerName} (${v.officerId})`} />
          <Info label="Officer Contact" value={v.officerPhone || '—'} />
          <Info label="Visit Date" value={v.date || '—'} />
          <Info label="Visit Time" value={v.time || '—'} />
        </dl>
      )}

      {/* Inline assign / reassign form */}
      {open && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <SelectField
              label={v.assigned ? 'New Technical Officer' : 'Technical Officer (available)'}
              name={`to-${v.rowId}`}
              value={toId}
              onChange={(e) => { setToId(e.target.value); setError('') }}
              options={officerOptions}
            />
          </div>
          <FormField
            label="Visit Date"
            name={`date-${v.rowId}`}
            type="date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setError('') }}
          />
          <FormField
            label="Visit Time"
            name={`time-${v.rowId}`}
            type="time"
            value={time}
            onChange={(e) => { setTime(e.target.value); setError('') }}
          />
          {error && <p className="text-sm text-red-300 sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <Button type="button" fullWidth disabled={submitting} onClick={submit}>
              {submitting
                ? 'Saving…'
                : v.assigned
                  ? 'Update & Notify Officer'
                  : 'Assign & Notify Officer'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

const Info = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs font-medium uppercase tracking-wide text-emerald-200/50">{label}</dt>
    <dd className="mt-0.5 text-white/90">{value}</dd>
  </div>
)

export default ValuationAssignRow
