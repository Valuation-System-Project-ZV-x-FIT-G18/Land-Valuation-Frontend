import { useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'
import FieldRenderer from '@/Role_Pages/coordinator/new-project/components/FieldRenderer'
import { validateField } from '@/Role_Pages/coordinator/new-project/validation/validateField'
import {
  projectSections,
  projectUploads,
} from '@/Role_Pages/coordinator/new-project/constants/projectFields'
import type { ProjectErrors, ProjectValues } from '@/Role_Pages/coordinator/new-project/types/new-project'
import {
  draftFileUrl,
  uploadDraftFile,
  type ProjectDetailsDraft,
} from '@/Role_Pages/loan-applicant/fill-form/api/fill-form'

const isVisible = (dependsOn: { field: string; value: string } | undefined, values: ProjectValues) =>
  !dependsOn || values[dependsOn.field] === dependsOn.value

const buildEmptyValues = (): ProjectValues => {
  const v: ProjectValues = {}
  projectSections.forEach((s) => s.fields.forEach((f) => (v[f.name] = '')))
  return v
}

type DraftEditorProps = {
  draft: ProjectDetailsDraft | null // null = creating a new one
  nic: string
  // Resolves with the saved draft's id, so newly-picked documents can be
  // attached to it straight after (a new draft has no id until it's saved).
  onSubmit: (
    label: string,
    values: ProjectValues,
  ) => Promise<{ ok: boolean; id?: number; error?: string }>
  // Called once the fields AND any picked documents have been saved.
  onSaved: () => void
  onCancel: () => void
}

// The full Create-Project-style field editor — same fields AND the same
// document upload slots — used both for a brand-new draft and for editing an
// existing one.
const DraftEditor = ({ draft, nic, onSubmit, onSaved, onCancel }: DraftEditorProps) => {
  // Keep unsaved typing across refreshes. The key includes the applicant NIC
  // and the draft being edited, so entries can never leak between accounts
  // or between an applicant's own properties in the same browser tab.
  const draftKey = `fillForm:${nic}:${draft?.id ?? 'new'}`
  const [label, setLabel] = useSessionState<string>(`${draftKey}:label`, draft?.label ?? '')
  const [values, setValues] = useSessionState<ProjectValues>(draftKey, {
    ...buildEmptyValues(),
    ...(draft?.data ?? {}),
  })
  const [errors, setErrors] = useState<ProjectErrors>({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  // Documents picked in this session, keyed by upload slot. They're sent
  // after the draft itself is saved, since a new draft has no id until then.
  const [picked, setPicked] = useState<Record<string, File | null>>({})
  // Documents already attached to this draft (when editing an existing one).
  const alreadyUploaded = new Map((draft?.files ?? []).map((f) => [f.docType, f.fileName]))

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setValues((v) => {
      const next = { ...v, [name]: value }
      projectSections.forEach((s) =>
        s.fields.forEach((f) => {
          if (f.optionsBy?.field !== name) return
          const stillValid = (f.optionsBy.map[value] ?? []).includes(next[f.name])
          if (!stillValid) next[f.name] = ''
        }),
      )
      return next
    })
    setErrors((p) => ({ ...p, [name]: '' }))
    setServerError('')
  }

  const validate = (): ProjectErrors => {
    const e: ProjectErrors = {}
    projectSections.forEach((s) =>
      s.fields.forEach((f) => {
        if (!isVisible(f.dependsOn, values)) return
        const msg = validateField(f, values[f.name] ?? '')
        if (msg) e[f.name] = msg
      }),
    )
    return e
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const found = validate()
    setErrors((p) => ({ ...p, [e.target.name]: found[e.target.name] ?? '' }))
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const found = validate()
    if (Object.values(found).some(Boolean)) return setErrors(found)
    setErrors({})
    setServerError('')
    setSaving(true)
    const res = await onSubmit(label, values)
    if (!res.ok) {
      setSaving(false)
      setServerError(res.error ?? 'Could not save the form.')
      return
    }

    // Draft saved — now attach any documents picked in this session.
    const draftId = res.id
    const toUpload = Object.entries(picked).filter(([, f]) => f)
    if (draftId && toUpload.length) {
      const results = await Promise.all(
        toUpload.map(([docType, f]) => uploadDraftFile(draftId, nic, docType, f as File)),
      )
      const failed = results.filter((r) => !r.ok)
      if (failed.length) {
        setSaving(false)
        setServerError(
          `Your details were saved, but ${failed.length} document(s) could not be uploaded. Please try attaching them again.`,
        )
        return
      }
    }
    // Saved for real — drop the refresh-persistence copy so a later "New
    // Property" (or re-opening this one) doesn't resurrect stale typing.
    sessionStorage.removeItem(draftKey)
    sessionStorage.removeItem(`${draftKey}:label`)

    setSaving(false)
    onSaved()
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button type="button" variant="outline" onClick={onCancel} className="!px-5 !py-2.5 text-sm">
        ← Back to my properties
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {draft ? 'Edit' : 'New'} <GradientText>Property</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Fill in as much as you know about the property. Your coordinator will confirm the rest
          when creating your project.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <Card className="p-6 sm:p-8">
          <FormField
            label="Property nickname"
            name="label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. My House, Land in Kandy"
          />
        </Card>

        {projectSections.map((section, i) => (
          <Card key={section.title} className="p-6 sm:p-8">
            <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
              <span>{section.icon}</span> {i + 5}. {section.title}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {section.fields
                .filter((f) => isVisible(f.dependsOn, values))
                .map((f) => (
                  <FieldRenderer
                    key={f.name}
                    field={f}
                    value={values[f.name]}
                    values={values}
                    error={errors[f.name]}
                    onChange={onChange}
                    onBlur={onBlur}
                  />
                ))}
            </div>
          </Card>
        ))}

        {/* Document uploads — same slots as the coordinator's Create Project
            form. All optional here: attach whatever you already have. */}
        <Card className="p-6 sm:p-8">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-white">
            <span>📎</span> 13. Documents
          </h2>
          <p className="mb-5 text-sm text-emerald-100/70">
            Attach any of these you already have (PDF or image). You can add the rest later.
          </p>
          <div className="space-y-2">
            {projectUploads.map((u) => {
              const existing = alreadyUploaded.get(u.name)
              const chosen = picked[u.name]
              return (
                <div
                  key={u.name}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white">{u.label}</p>
                    {chosen ? (
                      <p className="mt-0.5 truncate text-xs text-gold-200">📎 {chosen.name}</p>
                    ) : existing && draft ? (
                      <a
                        href={draftFileUrl(draft.id, u.name)}
                        className="mt-0.5 inline-flex items-center gap-1 text-xs text-gold-200 underline"
                      >
                        📎 {existing}
                      </a>
                    ) : null}
                  </div>
                  <label className="shrink-0 cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-emerald-100/80 transition hover:border-gold-400/50 hover:text-gold-200">
                    {chosen || existing ? 'Replace' : 'Upload'}
                    <input
                      type="file"
                      accept={u.accept}
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0] ?? null
                        setPicked((p) => ({ ...p, [u.name]: f }))
                        setServerError('')
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>
              )
            })}
          </div>
        </Card>

        {serverError && <p className="text-center text-sm text-red-300">{serverError}</p>}
        {Object.values(errors).some(Boolean) && (
          <p className="text-center text-sm text-amber-300">Please fix the highlighted fields above.</p>
        )}

        <Button type="submit" fullWidth disabled={saving}>
          {saving ? 'Sending…' : 'Send to Coordinator'}
        </Button>
      </form>
    </div>
  )
}

export default DraftEditor
