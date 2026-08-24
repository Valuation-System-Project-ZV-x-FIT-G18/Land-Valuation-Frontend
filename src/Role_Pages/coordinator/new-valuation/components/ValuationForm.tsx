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
  fetchValuationsByNic,
  type ExistingValuation,
} from '@/Role_Pages/coordinator/new-valuation/api/new-valuation'
import type {
  ProjectValues,
  ProjectErrors,
} from '@/Role_Pages/coordinator/new-project/types/new-project'

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
    const incoming = location.state as { projectId?: string; nic?: string } | null
    if (incoming?.projectId) {
      setProjectId(incoming.projectId)
      setNic(incoming.nic ?? '')
      setValues(buildEmptyValues()) // start blank — no stale bank/purpose/date/priority
      setLetter([]) // never carry over the previous request letter
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

    ;['newValuation:projectId', 'newValuation:nic', 'newValuation:values'].forEach((k) =>
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

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">
      {/* Project lookup / loaded-project banner */}
      {projectId ? (
        <Card className="space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-sm font-medium text-emerald-100">
              <span>✓</span> Project <span className="text-gold-300">{projectId}</span>
              <span className="text-emerald-200/60">· NIC {nic}</span>
            </p>
            <div className="flex gap-3">
              {existingValuations.length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  className="!px-5 !py-2.5 text-sm"
                  onClick={() => {
                    setShowValuations((v) => !v)
                    setOpenProject(null)
                  }}
                >
                  {showValuations ? 'Hide' : `View projects (${valuationProjects.length})`}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="!px-5 !py-2.5 text-sm"
                onClick={() => {
                  setProjectId('')
                  setNic('')
                }}
              >
                Change
              </Button>
            </div>
          </div>

          {/* Level 1 — the applicant's projects. */}
          {showValuations && !openProject && (
            <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
              {valuationProjects.map((p) => (
                <li key={p.projectId}>
                  <button
                    type="button"
                    onClick={() => setOpenProject(p.projectId)}
                    className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left text-sm transition hover:bg-white/5"
                  >
                    <span className="font-medium text-emerald-100">
                      Project <span className="text-gold-300">{p.projectId}</span>
                    </span>
                    <span className="text-emerald-200/70">
                      {p.vals.length} valuation{p.vals.length > 1 ? 's' : ''} →
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Level 2 — the valuations inside the chosen project. */}
          {showValuations && openProject && (
            <div className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="!px-5 !py-2 text-sm"
                onClick={() => setOpenProject(null)}
              >
                ← All projects
              </Button>
              <p className="text-sm font-medium text-emerald-100">
                Project <span className="text-gold-300">{openProject}</span>
              </p>
              <ul className="divide-y divide-white/10 rounded-xl border border-white/10">
                {valuationProjects
                  .find((p) => p.projectId === openProject)
                  ?.vals.map((v) => (
                    <li key={v.rowId}>
                      <button
                        type="button"
                        onClick={() => setViewingValuation(v.rowId)}
                        className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left text-sm transition hover:bg-white/5"
                      >
                        <span className="font-medium text-emerald-100">
                          Valuation <span className="text-gold-300">#{v.valuationId}</span>
                        </span>
                        <span className="flex items-center gap-3 text-emerald-200/70">
                          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs capitalize">
                            {v.status.replace(/_/g, ' ')}
                          </span>
                          {v.createdAt && <span>{new Date(v.createdAt).toLocaleDateString()}</span>}
                          <span className="text-gold-300">View ↗</span>
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </Card>
      ) : (
        <ProjectLookup
          onFound={(pid, foundNic) => {
            setProjectId(pid)
            setNic(foundNic)
          }}
        />
      )}

      {locked && (
        <p className="text-center text-sm text-emerald-200/60">
          Find a project above to fill in the valuation details.
        </p>
      )}

      <fieldset disabled={locked} className="space-y-8 transition disabled:pointer-events-none disabled:opacity-50">
        {valuationSections.map((section, i) => (
          <Card key={section.title} className="p-6 sm:p-8">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-white">
              {i + 1}. {section.title}
            </h2>
            {i === 0 && (
              <p className="mb-5 text-sm text-emerald-100/70">
                Project ID <span className="font-semibold text-gold-300">{projectId || '—'}</span> (auto-filled)
              </p>
            )}
            {i === 0 && (
              <div className="mb-5">
                <BankBranchSelect
                  bankName={values.bankName ?? ''}
                  branchCode={values.bankBranchCode ?? ''}
                  onSelect={onBankSelect}
                  bankError={errors.bankName}
                  branchError={errors.bankBranchCode}
                />
              </div>
            )}
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
            {i === 0 && (
              <div className="mt-5">
                <FileField
                  label="Bank's Request Letter"
                  name="bankRequestLetter"
                  accept=".pdf,.jpg,.jpeg,.png"
                  files={letter}
                  onChange={(_n, files) => setLetter(files)}
                />
              </div>
            )}
          </Card>
        ))}

        {serverError && <p className="text-center text-sm text-red-300">{serverError}</p>}

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Creating valuation…' : 'Create New Valuation'}
        </Button>
      </fieldset>
    </form>
  )
}

export default ValuationForm
