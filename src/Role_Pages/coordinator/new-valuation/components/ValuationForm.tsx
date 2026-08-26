import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import FieldRenderer from '@/Role_Pages/coordinator/new-project/components/FieldRenderer'
import FileField from '@/Role_Pages/coordinator/new-project/components/FileField'
import ProjectLookup from '@/Role_Pages/coordinator/new-valuation/components/ProjectLookup'
import BankBranchSelect, {
  type BankSelection,
} from '@/Role_Pages/coordinator/new-valuation/components/BankBranchSelect'
import ValuationDetailsView from '@/Role_Pages/coordinator/new-valuation/components/ValuationDetailsView'
import { validateField } from '@/Role_Pages/coordinator/new-project/validation/validateField'
import { valuationSections } from '@/Role_Pages/coordinator/new-valuation/constants/valuationFields'
import {
  createValuation,
  fetchValuationDetails,
  fetchValuationsByNic,
  type ExistingValuation,
} from '@/Role_Pages/coordinator/new-valuation/api/new-valuation'
import type {
  ProjectValues,
  ProjectErrors,
} from '@/Role_Pages/coordinator/new-project/types/new-project'
import {
  getProjectDetails,
  type ProjectDetails,
} from '@/Role_Pages/coordinator/project-status/api/project-status'

const buildEmptyValues = (): ProjectValues => {
  const v: ProjectValues = {}
  valuationSections.forEach((s) => s.fields.forEach((f) => (v[f.name] = '')))
  return v
}

const isVisible = (
  dependsOn: { field: string; value: string } | undefined,
  values: ProjectValues,
) => !dependsOn || values[dependsOn.field] === dependsOn.value

export type ValuationResult = {
  valuationId: number
  rowId: number
  projectId: string
  nic: string
}

type ValuationFormProps = { onDone: (result: ValuationResult) => void }

const ValuationForm = ({ onDone }: ValuationFormProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  // Persisted so a refresh keeps the loaded project and entered values.
  const [projectId, setProjectId] = useSessionState('newValuation:projectId', '')
  const [nic, setNic] = useSessionState('newValuation:nic', '')
  const [values, setValues] = useSessionState<ProjectValues>('newValuation:values', buildEmptyValues())
  const [letter, setLetter] = useState<File[]>([])
  const [errors, setErrors] = useState<ProjectErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [currentStep, setCurrentStep] = useSessionState('newValuation:step', 0)
  const [furthestStep, setFurthestStep] = useSessionState('newValuation:furthestStep', 0)
  const [projectDetails, setProjectDetails] = useState<ProjectDetails | null>(null)

  // Valuations already raised for this applicant (shown once a project is loaded).
  const [existingValuations, setExistingValuations] = useState<ExistingValuation[]>([])
  const [showValuations, setShowValuations] = useState(false)
  const [openProject, setOpenProject] = useState<string | null>(null) // drill-down level 2
  const [viewingValuation, setViewingValuation] = useState<number | null>(null)

  const locked = !projectId

  // Whenever we have a NIC, load any existing valuations for that applicant.
  useEffect(() => {
    if (!nic) {
      setExistingValuations([])
      return
    }
    fetchValuationsByNic(nic).then(setExistingValuations)
  }, [nic])

  useEffect(() => {
    if (!projectId) {
      setProjectDetails(null)
      return
    }
    getProjectDetails(projectId).then(setProjectDetails)
  }, [projectId])

  useEffect(() => {
    if (!projectId) return
    const count = existingValuations.filter((valuation) => valuation.projectId === projectId).length
    setValues((current) => ({
      ...current,
      valuationType: count === 0 ? 'New Valuation' : 'Revaluation',
      linkPreviousProject: count === 0 ? '' : projectId,
    }))
  }, [existingValuations, projectId, setValues])

  // Group the applicant's valuations by project for the two-level drill-down
  // (a NIC can have many projects, each with its own valuations).
  const valuationProjects = useMemo(() => {
    const m = new Map<string, ExistingValuation[]>()
    existingValuations.forEach((v) => {
      const arr = m.get(v.projectId) ?? []
      arr.push(v)
      m.set(v.projectId, arr)
    })
    return Array.from(m.entries())
      .map(([projectId, vals]) => ({
        projectId,
        vals: vals.slice().sort((a, b) => a.valuationId - b.valuationId),
      }))
      .sort((a, b) => a.projectId.localeCompare(b.projectId))
  }, [existingValuations])

  // Auto-fill from Create Project ("create a valuation?" flow): it passes the
  // new project's id + applicant NIC, so we load it straight away — no lookup.
  // A fresh arrival is a BRAND-NEW valuation, so wipe any details left over in
  // the session from a previous one (only the project itself carries in). The
  // state is then cleared so a later refresh keeps the in-progress values.
  useEffect(() => {
    const incoming = location.state as {
      projectId?: string
      nic?: string
      previousValuationRowId?: number
    } | null
    if (incoming?.projectId) {
      setProjectId(incoming.projectId)
      setNic(incoming.nic ?? '')
      // An initial valuation starts blank. A revaluation reuses the latest
      // request context, while its new request date and attachment stay blank.
      if (incoming.previousValuationRowId) {
        fetchValuationDetails(incoming.previousValuationRowId).then((previous) => {
          const reusable = previous?.details ?? {}
          setValues({
            ...buildEmptyValues(),
            ...reusable,
            bankRequestDate: '',
            valuationType: 'Revaluation',
            linkPreviousProject: incoming.projectId ?? '',
          })
        })
      } else {
        setValues(buildEmptyValues())
      }
      setLetter([]) // never carry over the previous request letter
      setCurrentStep(1)
      setFurthestStep(1)
      navigate(location.pathname, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }))
    setErrors((p) => ({ ...p, [e.target.name]: '' }))
    setServerError('')
  }

  // Bank/branch pick — stores the four bank fields on the valuation values so
  // they are saved with the valuation and shown in the report.
  const onBankSelect = (sel: BankSelection) => {
    setValues((v) => ({
      ...v,
      bankName: sel.bankName,
      branchName: sel.branchName,
      bankBranchCode: sel.branchCode,
      bankContactPerson: sel.contactPerson,
      bankContactNo: sel.contactNo,
    }))
    // Clear each inline error as soon as its value is chosen.
    setErrors((p) => ({
      ...p,
      bankName: sel.bankName ? '' : p.bankName,
      bankBranchCode: sel.branchCode ? '' : p.bankBranchCode,
    }))
    setServerError('')
  }

  const validate = (): ProjectErrors => {
    const e: ProjectErrors = {}
    valuationSections.forEach((s) =>
      s.fields.forEach((f) => {
        if (!isVisible(f.dependsOn, values)) return
        const msg = validateField(f, values[f.name] ?? '')
        if (msg) e[f.name] = msg
      }),
    )
    return e
  }

  const requestFields = valuationSections.flatMap((section) => section.fields).filter(
    (field) => !['valuationType', 'linkPreviousProject'].includes(field.name),
  )

  const validateRequestStep = (): ProjectErrors => {
    const found: ProjectErrors = {}
    requestFields.forEach((field) => {
      if (!isVisible(field.dependsOn, values)) return
      const message = validateField(field, values[field.name] ?? '')
      if (message) found[field.name] = message
    })
    if (!values.bankName) found.bankName = 'Please select a bank.'
    if (!values.bankBranchCode) found.bankBranchCode = 'Please select a branch.'
    return found
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    setErrors({})
    setServerError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const continueStep = () => {
    if (currentStep === 0 && !projectId) {
      setServerError('Select a property project before continuing.')
      return
    }
    if (currentStep === 1) {
      const found = validateRequestStep()
      if (Object.values(found).some(Boolean)) {
        setErrors(found)
        return
      }
    }
    const next = Math.min(currentStep + 1, 3)
    setFurthestStep((reached) => Math.max(reached, next))
    goToStep(next)
  }

  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const found = validate()
    setErrors((p) => ({ ...p, [e.target.name]: found[e.target.name] ?? '' }))
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const found = validate()
    // Bank/branch aren't in the section config, so validate them here — as
    // inline field errors shown under each dropdown, not a bottom banner.
    if (!values.bankName) found.bankName = 'Please select a bank.'
    if (!values.bankBranchCode) found.bankBranchCode = 'Please select a branch.'
    if (Object.values(found).some(Boolean)) return setErrors(found)
    setErrors({})
    setServerError('')
    setSubmitting(true)

    const fd = new FormData()
    fd.append('projectId', projectId)
    fd.append('applicantNic', nic)
    fd.append('data', JSON.stringify({ ...values, projectId }))
    if (letter[0]) fd.append('bankRequestLetter', letter[0])

    const res = await createValuation(fd)
    setSubmitting(false)
    if (!res.ok) return setServerError(res.error ?? 'Could not create the valuation.')

    ;['newValuation:projectId', 'newValuation:nic', 'newValuation:values', 'newValuation:step', 'newValuation:furthestStep'].forEach((k) =>
      sessionStorage.removeItem(k),
    )
    onDone({
      valuationId: res.valuationId ?? 0,
      rowId: res.rowId ?? 0,
      projectId,
      nic,
    })
  }

  // Viewing an existing valuation's full details (read only).
  if (viewingValuation !== null) {
    return (
      <ValuationDetailsView
        rowId={viewingValuation}
        onBack={() => setViewingValuation(null)}
      />
    )
  }

  const projectValuationCount = existingValuations.filter((valuation) => valuation.projectId === projectId).length
  const valuationLabel = projectValuationCount === 0 ? 'Initial valuation' : `Revaluation ${projectValuationCount}`
  const locationSummary = projectDetails
    ? [projectDetails.details.propertyNumber, projectDetails.details.streetName, projectDetails.details.villageTown].filter(Boolean).join(', ')
    : ''
  const steps = ['Select Project', 'Bank Request', 'Documents', 'Review & Create']

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <Card className="p-4 sm:p-5">
        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step}>
              <button type="button" onClick={() => goToStep(index)} className={`w-full rounded-xl border px-3 py-3 text-left transition ${index === currentStep ? 'border-accent-300/60 bg-accent-300/10' : index <= furthestStep ? 'border-emerald-300/25 bg-emerald-300/5 hover:bg-emerald-300/10' : 'border-white/10 bg-white/[0.03] opacity-70 hover:bg-white/[0.06]'}`}>
                <span className="block text-xs font-semibold text-emerald-100">Step {index + 1}</span>
                <span className={`mt-1 block text-sm font-semibold ${index === currentStep ? 'text-accent-200' : 'text-white'}`}>{step}</span>
              </button>
            </li>
          ))}
        </ol>
      </Card>

      {currentStep > furthestStep && (
        <div className="rounded-xl border border-sky-300/20 bg-sky-300/[0.07] px-4 py-3 text-sm text-sky-100/80">
          Preview only. Complete Step {furthestStep + 1} to unlock editing for this step.
        </div>
      )}

      {currentStep === 0 && (projectId ? (
        <Card className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">Selected property project</p>
              <h2 className="mt-1 text-xl font-bold text-accent-300">{projectId}</h2>
              <p className="mt-2 text-sm text-emerald-100">{locationSummary || projectDetails?.details.propertyType || 'Property details saved in the project'}</p>
              <p className="mt-1 text-xs text-emerald-100">Applicant NIC: {nic} · {projectValuationCount} existing valuation{projectValuationCount === 1 ? '' : 's'}</p>
            </div>
            <span className="rounded-full bg-accent-300/10 px-3 py-1 text-xs font-semibold text-accent-200">{valuationLabel}</span>
          </div>
          <Button type="button" variant="outline" className="mt-5 !px-4 !py-2 text-sm" onClick={() => { setProjectId(''); setNic(''); setCurrentStep(0); setFurthestStep(0) }}>Change project</Button>
        </Card>
      ) : <ProjectLookup onFound={(pid, foundNic) => { setProjectId(pid); setNic(foundNic); setServerError('') }} />)}

      <fieldset disabled={currentStep > furthestStep} className="contents">
      {currentStep === 1 && (
        <Card className="p-6 sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-bold text-white">Bank valuation request</h2><p className="mt-1 text-sm text-emerald-100">Project {projectId} · {valuationLabel}</p></div>
          </div>
          <BankBranchSelect bankName={values.bankName ?? ''} branchCode={values.bankBranchCode ?? ''} onSelect={onBankSelect} bankError={errors.bankName} branchError={errors.bankBranchCode} />
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {requestFields.map((field) => <FieldRenderer key={field.name} field={field} value={values[field.name]} values={values} error={errors[field.name]} onChange={onChange} onBlur={onBlur} />)}
          </div>
        </Card>
      )}

      {currentStep === 2 && (
        <Card className="p-6 sm:p-8">
          <h2 className="text-lg font-bold text-white">Valuation documents</h2>
          <p className="mb-6 mt-1 text-sm text-emerald-100">Upload the bank request letter for this valuation.</p>
          <FileField label="Bank's Request Letter" name="bankRequestLetter" accept=".pdf,.jpg,.jpeg,.png" files={letter} onChange={(_name, picked) => setLetter(picked)} />
        </Card>
      )}
      </fieldset>

      {currentStep === 3 && (
        <div className="space-y-4">
          <Card className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-white">Project</h2><button type="button" onClick={() => goToStep(0)} className="text-sm font-medium text-accent-300">Edit</button></div>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-emerald-200">Project ID</dt><dd className="mt-1 text-white">{projectId}</dd></div><div><dt className="text-xs text-emerald-200">Valuation</dt><dd className="mt-1 text-white">{valuationLabel}</dd></div><div><dt className="text-xs text-emerald-200">Applicant NIC</dt><dd className="mt-1 text-white">{nic}</dd></div><div><dt className="text-xs text-emerald-200">Property</dt><dd className="mt-1 text-white">{locationSummary || 'Saved property project'}</dd></div></dl>
          </Card>
          <Card className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-bold text-white">Bank request</h2><button type="button" onClick={() => goToStep(1)} className="text-sm font-medium text-accent-300">Edit</button></div>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2"><div><dt className="text-xs text-emerald-200">Bank</dt><dd className="mt-1 text-white">{values.bankName}</dd></div><div><dt className="text-xs text-emerald-200">Branch</dt><dd className="mt-1 text-white">{values.branchName} ({values.bankBranchCode})</dd></div>{requestFields.filter((field) => values[field.name]).map((field) => <div key={field.name}><dt className="text-xs text-emerald-200">{field.label}</dt><dd className="mt-1 text-white">{values[field.name]}</dd></div>)}</dl>
          </Card>
          <Card className="p-6"><div className="flex items-center justify-between gap-3"><h2 className="font-semibold text-white">Request letter</h2><button type="button" onClick={() => goToStep(2)} className="text-sm font-medium text-accent-300">Edit</button></div><p className="mt-3 text-sm text-emerald-100">{letter[0]?.name || 'Not provided'}</p></Card>
        </div>
      )}

      {serverError && <p className="text-center text-sm text-red-300">{serverError}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" disabled={currentStep === 0} onClick={() => goToStep(currentStep - 1)} className="sm:min-w-32">Back</Button>
        {currentStep > furthestStep
          ? <Button type="button" onClick={() => goToStep(furthestStep)} className="sm:min-w-44">Return to current step</Button>
          : currentStep < 3
            ? <Button type="button" onClick={continueStep} className="sm:min-w-44">Save &amp; Continue</Button>
            : <Button type="submit" disabled={submitting} className="sm:min-w-44">{submitting ? 'Creating valuation…' : 'Create Valuation'}</Button>}
      </div>
    </form>
  )
}

export default ValuationForm
