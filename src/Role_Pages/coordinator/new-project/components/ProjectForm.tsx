import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { searchApplicantByNic } from '@/Role_Pages/coordinator/create-project/api/create-project'
import {
  draftFileUrl,
  listDrafts,
  markDraftUsed,
  type ProjectDetailsDraft,
} from '@/Role_Pages/loan-applicant/fill-form/api/fill-form'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'
import { useSessionFiles, clearSessionFiles } from '@/Common_Pages/hooks/useSessionFiles'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import FileField from '@/Role_Pages/coordinator/new-project/components/FileField'
import FieldRenderer from '@/Role_Pages/coordinator/new-project/components/FieldRenderer'
import MapPicker from '@/Role_Pages/coordinator/new-project/components/MapPicker'
import NicGate from '@/Role_Pages/coordinator/new-project/components/NicGate'
import ProjectDetailsView from '@/Role_Pages/coordinator/project-status/components/ProjectDetailsView'
import { validateField } from '@/Role_Pages/coordinator/new-project/validation/validateField'
import {
  projectSections,
  projectUploads,
} from '@/Role_Pages/coordinator/new-project/constants/projectFields'
import { createProject } from '@/Role_Pages/coordinator/new-project/api/new-project'
import type {
  ProjectValues,
  ProjectFiles,
  ProjectErrors,
} from '@/Role_Pages/coordinator/new-project/types/new-project'

// Build empty state from the field config.
const buildEmptyValues = (): ProjectValues => {
  const v: ProjectValues = { latitude: '', longitude: '' }
  projectSections.forEach((s) => s.fields.forEach((f) => (v[f.name] = '')))
  return v
}
const buildEmptyFiles = (): ProjectFiles => {
  const f: ProjectFiles = {}
  projectUploads.forEach((u) => (f[u.name] = []))
  return f
}
const isVisible = (
  dependsOn: { field: string; value: string } | undefined,
  values: ProjectValues,
) => !dependsOn || values[dependsOn.field] === dependsOn.value

// A short line to tell an applicant's drafts apart at a glance.
const summarizeDraft = (data: Record<string, string>) =>
  [data.propertyNumber, data.streetName, data.villageTown].filter(Boolean).join(', ')

const fileNamesByType = (draft: ProjectDetailsDraft) =>
  Object.fromEntries((draft.files ?? []).map((f) => [f.docType, f.fileName]))

type ProjectFormProps = { onDone: (projectId: string, nic: string) => void }

const ProjectForm = ({ onDone }: ProjectFormProps) => {
  // Persisted so a refresh keeps the entered values, the unlocked applicant and
  // the chosen files (files are stored in IndexedDB — see useSessionFiles).
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [applicantNic, setApplicantNic] = useSessionState('createProject:nic', '')
  const [ownerName, setOwnerName] = useSessionState('createProject:owner', '')
  const [values, setValues] = useSessionState<ProjectValues>('createProject:values', buildEmptyValues())
  const [files, setFiles] = useSessionFiles('createProject:files', buildEmptyFiles())

  // The applicant's own submitted drafts (Fill Form) — an applicant can have
  // more than one property, so this is a picker, not a blind auto-fill. The
  // one actually used only gets marked "Used" once the project is created.
  const [applicantDrafts, setApplicantDrafts] = useState<ProjectDetailsDraft[]>([])
  const [selectedDraftId, setSelectedDraftId] = useSessionState<number | null>('createProject:draftId', null)
  const [draftFileNames, setDraftFileNames] = useSessionState<Record<string, string>>(
    'createProject:draftFiles',
    {},
  )
  const [showDraftPicker, setShowDraftPicker] = useState(false)

  const loadApplicantDrafts = async (nic: string) => {
    const res = await listDrafts(nic)
    setApplicantDrafts(res.drafts)
    if (selectedDraftId != null) {
      const selected = res.drafts.find((d) => d.id === selectedDraftId)
      setDraftFileNames(selected ? fileNamesByType(selected) : {})
    }
    // Open the picker when there's something to choose — but don't reopen it
    // over a coordinator who has already picked one and is filling the form.
    setShowDraftPicker(res.drafts.length > 0 && selectedDraftId == null)
  }

  // Loading a draft brings across BOTH the typed details and the documents
  // the applicant already attached — they shouldn't have to send a PDF twice,
  // and the coordinator shouldn't have to re-upload it. Everything stays
  // editable/replaceable afterwards.
  const useDraft = (draft: ProjectDetailsDraft) => {
    setValues({ ...buildEmptyValues(), ...draft.data })
    setSelectedDraftId(draft.id)
    setDraftFileNames(fileNamesByType(draft))
    setShowDraftPicker(false)
    setFiles(buildEmptyFiles())
  }
  const startBlank = () => {
    setValues(buildEmptyValues())
    setFiles(buildEmptyFiles())
    setSelectedDraftId(null)
    setDraftFileNames({})
    setShowDraftPicker(false)
  }

  // Arriving from Register Applicant / applicant search passes a NIC — a NEW project.
  useEffect(() => {
    const incoming = (location.state as { nic?: string } | null)?.nic
    if (!incoming) return
    setApplicantNic(incoming)
    setValues(buildEmptyValues())
    setFiles(buildEmptyFiles()) // never carry a previous applicant's documents over
    setSelectedDraftId(null)
    setDraftFileNames({})
    // The applicant's submitted forms load via the effect keyed on applicantNic.
    searchApplicantByNic(incoming).then((res) => setOwnerName(res.found ? res.applicant?.name ?? '' : ''))
    navigate(location.pathname, { replace: true }) // consume the state so a refresh keeps the session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [errors, setErrors] = useState<ProjectErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  // Existing projects already created for the confirmed applicant.
  const [existingProjects, setExistingProjects] = useState<{ projectId: string; status: string }[]>([])
  const [showProjects, setShowProjects] = useState(false)
  const [viewingProject, setViewingProject] = useState<string | null>(null)

  useEffect(() => {
    if (!applicantNic) {
      setExistingProjects([])
      return
    }
    fetch(`/api/coordinator/projects/status?q=${encodeURIComponent(applicantNic)}`)
      .then((r) => r.json())
      .then((body) => setExistingProjects((body.projects ?? []).filter((p: { nic: string }) => p.nic === applicantNic)))
      .catch(() => setExistingProjects([]))
  }, [applicantNic])

  // Keep the applicant's submitted forms available whenever an applicant is
  // set — including after a refresh, where the confirmed NIC is restored from
  // the session but this list isn't.
  useEffect(() => {
    if (!applicantNic) {
      setApplicantDrafts([])
      setDraftFileNames({})
      return
    }
    loadApplicantDrafts(applicantNic)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applicantNic])

  const locked = !applicantNic

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target
    setValues((v) => {
      const next = { ...v, [name]: value }
      // Changing a field (e.g. Province) can invalidate a dependent select's
      // current choice (e.g. District) — clear it so a stale value isn't kept.
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
  const onFile = (name: string, picked: File[]) => {
    setFiles((f) => ({ ...f, [name]: picked }))
    if (picked.length) setDraftFileNames((f) => ({ ...f, [name]: '' }))
    setErrors((p) => ({ ...p, [name]: '' }))
  }
  const removeDraftFile = (name: string) => {
    setDraftFileNames((f) => ({ ...f, [name]: '' }))
    setErrors((p) => ({ ...p, [name]: '' }))
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
    projectUploads.forEach((u) => {
      if (u.required && files[u.name].length === 0 && !draftFileNames[u.name]) {
        e[u.name] = 'Please upload this file.'
      }
    })
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
    setSubmitting(true)

    const fd = new FormData()
    fd.append('applicantNic', applicantNic)
    fd.append('coordinatorId', user?.userId ?? '') // to notify the coordinator
    fd.append('data', JSON.stringify(values))
    if (selectedDraftId != null) {
      fd.append('sourceDraftId', String(selectedDraftId))
      fd.append('sourceDraftFileTypes', JSON.stringify(Object.keys(draftFileNames).filter((k) => draftFileNames[k])))
    }
    projectUploads.forEach((u) => files[u.name].forEach((file) => fd.append(u.name, file)))

    const res = await createProject(fd)
    setSubmitting(false)
    if (!res.ok) return setServerError(res.error ?? 'Could not create the project.')

    // Only now — the project actually got created — mark the applicant's
    // draft (if one was used) as used, so it won't get offered again for an
    // unrelated later project.
    if (selectedDraftId != null) void markDraftUsed(selectedDraftId)

    // Clear persisted data, then hand the id + NIC to the success popup.
    ;[
      'createProject:nic',
      'createProject:owner',
      'createProject:values',
      'createProject:draftId',
      'createProject:draftFiles',
    ].forEach((k) => sessionStorage.removeItem(k))
    clearSessionFiles('createProject:files')
    onDone(res.projectId ?? '', applicantNic)
  }

  // Viewing an existing project's full details (all fields + documents).
  if (viewingProject) {
    return <ProjectDetailsView projectId={viewingProject} onBack={() => setViewingProject(null)} />
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* NIC gate / confirmed owner banner */}
      {applicantNic ? (
        <Card className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-100">
              <span>✓</span> {ownerName}
              <span className="text-emerald-200/60">· NIC {applicantNic}</span>
            </p>
            <div className="flex gap-3">
              {applicantDrafts.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="!px-5 !py-2.5 text-sm"
                  onClick={() => setShowDraftPicker((v) => !v)}
                >
                  {showDraftPicker ? 'Hide' : `Applicant's forms (${applicantDrafts.length})`}
                </Button>
              )}
              {existingProjects.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="!px-5 !py-2.5 text-sm"
                  onClick={() => setShowProjects((v) => !v)}
                >
                  {showProjects ? 'Hide' : `View projects (${existingProjects.length})`}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="!px-5 !py-2.5 text-sm"
                onClick={() => {
                  setApplicantNic('')
                  setOwnerName('')
                  setSelectedDraftId(null)
                  setDraftFileNames({})
                  setFiles(buildEmptyFiles())
                }}
              >
                Change
              </Button>
            </div>
          </div>

          {showDraftPicker && applicantDrafts.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200/60">
                This applicant sent in the following — pick one to start from (still fully
                editable), or fill the form in yourself below.
              </p>
              {applicantDrafts.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                    selectedDraftId === d.id
                      ? 'border-gold-400/50 bg-gold-400/10'
                      : 'border-white/10 bg-white/5'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">
                      {d.label || 'Untitled property'}
                      {d.status === 'Used' && (
                        <span className="ml-2 rounded-full border border-emerald-400/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-200">
                          Used before
                        </span>
                      )}
                    </p>
                    <p className="truncate text-xs text-emerald-200/60">
                      {summarizeDraft(d.data) || 'No details filled in'}
                      {d.files?.length ? ` · 📎 ${d.files.length} document(s)` : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => useDraft(d)}
                  >
                    {selectedDraftId === d.id ? '✓ Selected' : 'Use this'}
                  </Button>
                </div>
              ))}
              <button
                type="button"
                onClick={startBlank}
                className="text-xs text-emerald-200/60 underline hover:text-emerald-100"
              >
                Start with a blank form instead
              </button>
            </div>
          )}

          {showProjects && existingProjects.length > 0 && (
            <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200/60">
                Projects already created for this applicant — click to view all details
              </p>
              {existingProjects.map((p) => (
                <button
                  key={p.projectId}
                  type="button"
                  onClick={() => setViewingProject(p.projectId)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-white/5"
                >
                  <span className="font-medium text-gold-300">{p.projectId}</span>
                  <span className="text-xs text-emerald-100/70">{p.status} · View →</span>
                </button>
              ))}
            </div>
          )}
        </Card>
      ) : (
        <NicGate
          onConfirmed={(nic, name) => {
            setApplicantNic(nic)
            setOwnerName(name)
            setValues(buildEmptyValues()) // start empty; the draft picker offers a starting point
            setFiles(buildEmptyFiles()) // never carry a previous applicant's documents over
            setSelectedDraftId(null)
            setDraftFileNames({})
            // Their submitted forms load via the effect keyed on applicantNic.
          }}
        />
      )}

      {locked && (
        <p className="text-center text-sm text-emerald-200/60">
          Enter a registered applicant&apos;s NIC above to fill in the valuation details.
        </p>
      )}

      {/* Everything below is disabled until the applicant is confirmed. */}
      <fieldset disabled={locked} className="space-y-8 transition disabled:pointer-events-none disabled:opacity-50">
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
              {section.hasMap && (
                <MapPicker
                  lat={values.latitude ?? ''}
                  lng={values.longitude ?? ''}
                  onPick={(lat, lng) => {
                    setValues((v) => ({
                      ...v,
                      latitude: lat.toFixed(7),
                      longitude: lng.toFixed(7),
                    }))
                    setServerError('')
                  }}
                  onTextChange={(latitude, longitude) => {
                    setValues((v) => ({ ...v, latitude, longitude }))
                    setServerError('')
                  }}
                />
              )}
            </div>
          </Card>
        ))}

        {/* Section 13 — Document uploads */}
        <Card className="p-6 sm:p-8">
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-white">
            <span>📎</span> 13. Document Uploads
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {projectUploads.map((u) => (
              <FileField
                key={u.name}
                label={u.required ? `${u.label} *` : u.label}
                name={u.name}
                accept={u.accept}
                files={files[u.name]}
                onChange={onFile}
                multiple={u.multiple}
                error={errors[u.name]}
                existingFileName={draftFileNames[u.name]}
                existingFileUrl={
                  selectedDraftId != null && draftFileNames[u.name]
                    ? draftFileUrl(selectedDraftId, u.name)
                    : undefined
                }
                onRemoveExisting={removeDraftFile}
              />
            ))}
          </div>
        </Card>

        {serverError && <p className="text-center text-sm text-red-300">{serverError}</p>}
        {Object.values(errors).some(Boolean) && (
          <p className="text-center text-sm text-amber-300">
            Please fix the highlighted fields above.
          </p>
        )}

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Submitting project…' : 'Submit Project'}
        </Button>
      </fieldset>
    </form>
  )
}

export default ProjectForm
