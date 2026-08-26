import { useCallback, useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import DraftEditor from '@/Role_Pages/loan-applicant/fill-form/components/DraftEditor'
import {
  listDrafts,
  createDraft,
  updateDraft,
  deleteDraft,
  type ProjectDetailsDraft,
} from '@/Role_Pages/loan-applicant/fill-form/api/fill-form'
import type { ProjectValues } from '@/Role_Pages/coordinator/new-project/types/new-project'

const time = (iso: string) => {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? '' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

// A short line to tell drafts apart at a glance, since a label is optional.
const summarize = (data: Record<string, string>) =>
  [data.propertyNumber, data.streetName, data.villageTown].filter(Boolean).join(', ')

// Loan Applicant > Fill Form. An applicant can have more than one property
// (and so more than one project) — this is a LIST of drafts, each the same
// field set as the coordinator's Create Project form (minus document
// uploads). The coordinator picks which one (if any) to start a project
// from when creating one for this applicant.
const FillFormPage = () => {
  const { user } = useAuth()
  const nic = user?.userId ?? '' // a loan applicant's user_id is their NIC

  const [drafts, setDrafts] = useState<ProjectDetailsDraft[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<ProjectDetailsDraft | 'new' | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    if (!nic) return
    setLoading(true)
    setDrafts((await listDrafts(nic)).drafts)
    setLoading(false)
  }, [nic])

  useEffect(() => {
    load()
  }, [load])

  // Saves the fields and returns the draft's id, so DraftEditor can attach
  // any documents picked in this session (a new draft has no id until it's
  // saved). The editor stays open until those uploads finish — it closes
  // itself via onSaved below.
  const handleSave = async (label: string, values: ProjectValues) => {
    const existingId = editing && editing !== 'new' ? editing.id : null
    return existingId
      ? { ...(await updateDraft(existingId, nic, label, values)), id: existingId }
      : await createDraft(nic, label, values)
  }

  const handleSaved = async () => {
    setEditing(null)
    setNotice('Your property details were successfully sent to the coordinator.')
    await load()
  }

  const handleDelete = async (id: number) => {
    setDeleting(id)
    const res = await deleteDraft(id, nic)
    setDeleting(null)
    if (res.ok) await load()
  }

  if (editing) {
    return (
      <DraftEditor
        draft={editing === 'new' ? null : editing}
        nic={nic}
        onSubmit={handleSave}
        onSaved={handleSaved}
        onCancel={() => setEditing(null)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Fill <GradientText>Form</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100">
          Send your coordinator the property details you know. Have more than one property? Add
          a separate entry for each.
        </p>
      </div>

      <SuccessModal
        open={!!notice}
        title="Successfully Sent"
        message={notice}
        closeLabel="Done"
        onClose={() => setNotice('')}
      />

      <Button type="button" fullWidth onClick={() => { setNotice(''); setEditing('new') }}>
        + New Property
      </Button>

      {loading ? (
        <p className="text-center text-sm text-emerald-200">Loading…</p>
      ) : drafts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-sm text-emerald-100">
            You haven&apos;t sent any property details yet. Click &quot;+ New Property&quot; to
            start.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {drafts.map((d) => (
            <Card key={d.id} hover className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-white">
                  {d.label || 'Untitled property'}
                </p>
                <p className="mt-0.5 truncate text-xs text-emerald-200">
                  {summarize(d.data) || 'No details filled in yet'}
                </p>
                <p className="mt-0.5 text-[11px] text-emerald-200">Updated {time(d.updatedAt)}</p>
              </div>
              <span
                className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${
                  d.status === 'Used'
                    ? 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
                    : 'border-amber-400/30 bg-amber-400/15 text-amber-200'
                }`}
              >
                {d.status === 'Used' ? 'Used in a project' : 'Pending'}
              </span>
              <div className="flex shrink-0 gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => { setNotice(''); setEditing(d) }}>
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={deleting === d.id}
                  onClick={() => handleDelete(d.id)}
                >
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default FillFormPage
