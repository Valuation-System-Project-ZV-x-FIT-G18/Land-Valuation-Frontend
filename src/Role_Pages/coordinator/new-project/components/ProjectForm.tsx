import { useEffect, useRef, useState } from 'react'
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

const wizardSteps = [
  { title: 'Property Basics', description: 'Property, address, location and ownership', sections: [0, 1, 4] },
  { title: 'Land Details', description: 'Survey plan and land extent', sections: [2, 3] },
  { title: 'Access & Boundaries', description: 'Boundaries, legal details and planning', sections: [5, 6, 7] },
  { title: 'Documents', description: 'Required property documents', sections: [] },
  { title: 'Review', description: 'Check the details before creating the project', sections: [] },
] as const

const sampleLocations = [
  { town: 'Kaduwela', city: 'Kaduwela', road: 'Biyagama Road', province: 'Western', district: 'Colombo', postal: '10640', lat: '6.9352000', lng: '79.9841000', gn: 'Kaduwela', ds: 'Kaduwela' },
  { town: 'Homagama', city: 'Homagama', road: 'High Level Road', province: 'Western', district: 'Colombo', postal: '10200', lat: '6.8412000', lng: '80.0032000', gn: 'Homagama', ds: 'Homagama' },
  { town: 'Gampaha', city: 'Gampaha', road: 'Colombo Road', province: 'Western', district: 'Gampaha', postal: '11000', lat: '7.0873000', lng: '80.0144000', gn: 'Medagama', ds: 'Gampaha' },
  { town: 'Piliyandala', city: 'Piliyandala', road: 'Kesbewa Road', province: 'Western', district: 'Colombo', postal: '10300', lat: '6.8018000', lng: '79.9227000', gn: 'Piliyandala', ds: 'Kesbewa' },
] as const

const buildSampleValues = (ownerName: string): ProjectValues => {
  const seed = Date.now()
  const location = sampleLocations[seed % sampleLocations.length]
  const suffix = String(seed).slice(-6)
  const values = buildEmptyValues()
  return {
    ...values,
    propertyType: 'Bare Land', propertyNumber: `TEST-${suffix}`, streetName: location.road,
    villageTown: location.town, propertyCity: location.city, gnDivision: location.gn,
    dsDivision: location.ds, province: location.province, district: location.district,
    postalCode: location.postal, latitude: location.lat, longitude: location.lng,
    landTraditionalName: `Sample Garden ${suffix}`, localAuthorityType: 'Pradeshiya Sabha',
    localAuthorityName: `${location.city} Pradeshiya Sabha`, pattu: 'Sample Pattu', korale: 'Sample Korale',
    surveyPlanNumber: `TEST-SP-${suffix}`, surveyPlanDate: '2024-06-15',
    surveyorName: 'Sample Licensed Surveyor', surveyorLicenseNo: `TEST-LS-${suffix}`,
    lotNumber: `Lot ${Number(suffix.slice(-2)) || 1}`, planOlderThan10: 'No',
    extentAcres: '0', extentRoods: '0', extentPerches: String(10 + (seed % 31)), extentHectares: '',
    deedExtentAcres: '0', deedExtentRoods: '0', deedExtentPerches: String(10 + (seed % 31)), deedExtentHectares: '',
    extentAsPerPlan: `${10 + (seed % 31)} Perches`, extentAsPerDeed: `${10 + (seed % 31)} Perches`, extentsTally: 'Yes',
    deedType: 'Deed of Transfer', ownershipType: 'Freehold', deedNumber: `TEST-D-${suffix}`,
    deedDate: '2023-11-20', attorneyName: 'Sample Notary Public', notaryNoLocation: `TEST-NP / ${location.city}`,
    ownerNameAsPerDeed: ownerName || 'Sample Applicant', previousOwnerName: 'Sample Previous Owner',
    boundaryNorth: 'Existing access road', boundaryEast: 'Adjoining residential land',
    boundarySouth: 'Adjoining bare land', boundaryWest: 'Existing boundary fence',
    rightOfWayAvailable: 'Yes', rightOfWayFrom: 'Northern boundary',
    assessmentNumber: `TEST-AS-${suffix}`, assessmentLetterDate: '2025-01-10',
    assessmentAuthority: `${location.city} Pradeshiya Sabha`, streetLineCertDate: '2025-02-12',
    affectedByStreetLines: 'No', affectedByBuildingLimits: 'No', distFromMainRoad: '35', distFromByRoad: '12',
    planApprovedByLA: 'Yes', planApprovalRef: `TEST-PA-${suffix}`, planApprovalDate: '2024-08-01',
    planApprovalPurpose: 'Residential',
  }
}

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
  const [currentStep, setCurrentStep] = useSessionState('createProject:step', 0)
  const [furthestStep, setFurthestStep] = useSessionState('createProject:furthestStep', 0)

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
    setCurrentStep(0)
    setFurthestStep(0)
  }
  const startBlank = () => {
    setValues(buildEmptyValues())
    setFiles(buildEmptyFiles())
    setSelectedDraftId(null)
    setDraftFileNames({})
    setShowDraftPicker(false)
    setCurrentStep(0)
    setFurthestStep(0)
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
    setCurrentStep(0)
    setFurthestStep(0)
    // The applicant's submitted forms load via the effect keyed on applicantNic.
    searchApplicantByNic(incoming).then((res) => setOwnerName(res.found ? res.applicant?.name ?? '' : ''))
    navigate(location.pathname, { replace: true }) // consume the state so a refresh keeps the session
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const [errors, setErrors] = useState<ProjectErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const submitLock = useRef(false)
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

  const validateStep = (step: number): ProjectErrors => {
    const e: ProjectErrors = {}
    if (step <= 2) {
      wizardSteps[step].sections.forEach((sectionIndex) => {
        projectSections[sectionIndex].fields.forEach((f) => {
          if (!isVisible(f.dependsOn, values)) return
          const msg = validateField(f, values[f.name] ?? '')
          if (msg) e[f.name] = msg
        })
      })
    }
    if (step === 3) {
      projectUploads.forEach((u) => {
        if (u.required && files[u.name].length === 0 && !draftFileNames[u.name]) {
          e[u.name] = 'Please upload this file.'
        }
      })
    }
    return e
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    setErrors({})
    setServerError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const continueToNextStep = () => {
    const found = validateStep(currentStep)
    if (Object.values(found).some(Boolean)) {
      setErrors(found)
      return
    }
    const next = Math.min(currentStep + 1, wizardSteps.length - 1)
    setFurthestStep((reached) => Math.max(reached, next))
    goToStep(next)
  }

  const stepForError = (name: string) => {
    const sectionIndex = projectSections.findIndex((section) => section.fields.some((field) => field.name === name))
    if (sectionIndex >= 0) {
      return wizardSteps.findIndex((step) => step.sections.some((index) => index === sectionIndex))
    }
    return projectUploads.some((upload) => upload.name === name) ? 3 : 0
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const found = validate()
    setErrors((p) => ({ ...p, [e.target.name]: found[e.target.name] ?? '' }))
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (submitLock.current) return
    const found = validate()
    if (Object.values(found).some(Boolean)) {
      setErrors(found)
      const firstError = Object.keys(found)[0]
      goToStep(stepForError(firstError))
      return
    }
    setErrors({})
    setServerError('')
    submitLock.current = true
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
    if (!res.ok) {
      submitLock.current = false
      setServerError(res.error ?? 'Could not create the project.')
      return
    }

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
      'createProject:step',
      'createProject:furthestStep',
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
              <span className="text-emerald-200">· NIC {applicantNic}</span>
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
                  setCurrentStep(0)
                  setFurthestStep(0)
                }}
              >
                Change
              </Button>
            </div>
          </div>

          {showDraftPicker && applicantDrafts.length > 0 && (
            <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
                This applicant sent in the following — pick one to start from (still fully
                editable), or fill the form in yourself below.
              </p>
              {applicantDrafts.map((d) => (
                <div
                  key={d.id}
                  className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2 ${
                    selectedDraftId === d.id
                      ? 'border-accent-400/50 bg-accent-400/10'
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
                    <p className="truncate text-xs text-emerald-200">
                      {summarizeDraft(d.data) || 'No details filled in'}
                      {d.files?.length ? ` · ${d.files.length} document(s)` : ''}
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
                className="text-xs text-emerald-200 underline hover:text-emerald-100"
              >
                Start with a blank form instead
              </button>
            </div>
          )}

          {showProjects && existingProjects.length > 0 && (
            <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
                Projects already created for this applicant — click to view all details
              </p>
              {existingProjects.map((p) => (
                <button
                  key={p.projectId}
                  type="button"
                  onClick={() => setViewingProject(p.projectId)}
                  className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-white/5"
                >
                  <span className="font-medium text-accent-300">{p.projectId}</span>
                  <span className="text-xs text-emerald-100">{p.status} · View →</span>
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
            setCurrentStep(0)
            setFurthestStep(0)
            // Their submitted forms load via the effect keyed on applicantNic.
          }}
        />
      )}

      {locked && (
        <Card className="p-6 sm:p-8">
          <div className="text-center">
            <h2 className="text-lg font-semibold text-white">What you&apos;ll complete</h2>
            <p className="mt-1 text-sm text-emerald-100">
              Select a registered applicant above to unlock these project steps.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {wizardSteps.map((step, index) => (
              <div key={step.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-xs font-bold text-emerald-100">
                  {index + 1}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-emerald-100">{step.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {!locked && (
        <fieldset className="space-y-6">
          <Card className="p-4 sm:p-5">
            <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {wizardSteps.map((step, index) => (
                <li key={step.title}>
                  <button
                    type="button"
                    onClick={() => goToStep(index)}
                    className={`w-full rounded-xl border px-3 py-3 text-left transition ${
                      index === currentStep
                        ? 'border-accent-300/60 bg-accent-300/10'
                        : index <= furthestStep
                          ? 'border-emerald-300/25 bg-emerald-300/5 hover:bg-emerald-300/10'
                          : 'border-white/10 bg-white/[0.03] opacity-70 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="block text-xs font-semibold text-emerald-100">Step {index + 1}</span>
                    <span className={`mt-1 block text-sm font-semibold ${index === currentStep ? 'text-accent-200' : 'text-white'}`}>
                      {step.title}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </Card>

          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="text-2xl font-bold text-white">{wizardSteps[currentStep].title}</h2><p className="mt-1 text-sm text-emerald-100">{wizardSteps[currentStep].description}</p></div>
              {import.meta.env.DEV && currentStep === 0 && (
                <Button type="button" variant="outline" size="sm" onClick={() => { setValues(buildSampleValues(ownerName)); setErrors({}); setServerError('') }}>
                  Fill all steps with sample data
                </Button>
              )}
            </div>
          </div>

          {currentStep > furthestStep && (
            <div className="rounded-xl border border-sky-300/20 bg-sky-300/[0.07] px-4 py-3 text-sm text-sky-100/80">
              Preview only. Complete Step {furthestStep + 1} to unlock editing for this step.
            </div>
          )}

          <fieldset disabled={currentStep > furthestStep} className="contents">
          {currentStep <= 2 && wizardSteps[currentStep].sections.map((sectionIndex) => {
            const section = projectSections[sectionIndex]
            return (
              <Card key={section.title} className="p-6 sm:p-8">
                <h3 className="mb-5 text-lg font-bold text-white">{section.title}</h3>
                <div className="grid gap-5 sm:grid-cols-2">
                  {section.fields.filter((f) => isVisible(f.dependsOn, values)).map((f) => (
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
                        setValues((v) => ({ ...v, latitude: lat.toFixed(7), longitude: lng.toFixed(7) }))
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
            )
          })}

          {currentStep === 3 && (
            <Card className="p-6 sm:p-8">
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
                    existingFileUrl={selectedDraftId != null && draftFileNames[u.name] ? draftFileUrl(selectedDraftId, u.name) : undefined}
                    onRemoveExisting={removeDraftFile}
                  />
                ))}
              </div>
            </Card>
          )}
          </fieldset>

          {currentStep === 4 && (
            <div className="space-y-4">
              <Card className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
                <div><p className="text-xs uppercase tracking-wide text-emerald-200">Applicant</p><p className="mt-1 font-medium text-white">{ownerName}</p></div>
                <div><p className="text-xs uppercase tracking-wide text-emerald-200">NIC</p><p className="mt-1 font-medium text-white">{applicantNic}</p></div>
              </Card>
              {projectSections.map((section, sectionIndex) => {
                const filled = section.fields.filter((field) => isVisible(field.dependsOn, values) && values[field.name])
                if (!filled.length) return null
                return (
                  <Card key={section.title} className="p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="font-semibold text-white">{section.title}</h3>
                      <button type="button" onClick={() => goToStep(stepForError(section.fields[0].name))} className="text-sm font-medium text-accent-300 hover:text-accent-200">Edit</button>
                    </div>
                    <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {filled.map((field) => (
                        <div key={field.name}><dt className="text-xs text-emerald-200">{field.label}</dt><dd className="mt-0.5 break-words text-sm text-emerald-50">{values[field.name]}</dd></div>
                      ))}
                    </dl>
                  </Card>
                )
              })}
              <Card className="p-6">
                <div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-white">Documents</h3><button type="button" onClick={() => goToStep(3)} className="text-sm font-medium text-accent-300 hover:text-accent-200">Edit</button></div>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {projectUploads.map((upload) => (
                    <li key={upload.name} className="text-sm text-emerald-100">{upload.label}: <span className="text-white">{files[upload.name][0]?.name || draftFileNames[upload.name] || 'Not provided'}</span></li>
                  ))}
                </ul>
              </Card>
            </div>
          )}

          {serverError && <p className="text-center text-sm text-red-300">{serverError}</p>}
          {Object.values(errors).some(Boolean) && <p className="text-center text-sm text-amber-300">Please fix the highlighted fields before continuing.</p>}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => currentStep === 0 ? navigate('/coordinator/applicants') : goToStep(currentStep - 1)}
              className="sm:min-w-40"
            >
              {currentStep === 0 ? 'Back to Applicant' : 'Back'}
            </Button>
            {currentStep > furthestStep ? (
              <Button type="button" onClick={() => goToStep(furthestStep)} className="sm:min-w-44">Return to current step</Button>
            ) : currentStep < wizardSteps.length - 1 ? (
              <Button type="button" onClick={continueToNextStep} className="sm:min-w-44">Save &amp; Continue</Button>
            ) : (
              <Button type="submit" disabled={submitting} className="sm:min-w-44">{submitting ? 'Creating project…' : 'Create Project'}</Button>
            )}
          </div>
        </fieldset>
      )}
    </form>
  )
}

export default ProjectForm
