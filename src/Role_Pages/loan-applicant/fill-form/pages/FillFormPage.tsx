import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import FieldRenderer from '@/Role_Pages/coordinator/new-project/components/FieldRenderer'
import { validateField } from '@/Role_Pages/coordinator/new-project/validation/validateField'
import { projectSections } from '@/Role_Pages/coordinator/new-project/constants/projectFields'
import type { ProjectErrors, ProjectValues } from '@/Role_Pages/coordinator/new-project/types/new-project'
import { getProjectDetailsDraft, saveProjectDetailsDraft } from '@/Role_Pages/loan-applicant/fill-form/api/fill-form'

const isVisible = (dependsOn: { field: string; value: string } | undefined, values: ProjectValues) =>
  !dependsOn || values[dependsOn.field] === dependsOn.value

const buildEmptyValues = (): ProjectValues => {
  const v: ProjectValues = {}
  projectSections.forEach((s) => s.fields.forEach((f) => (v[f.name] = '')))
  return v
}

// Loan Applicant > Fill Form. Same fields as the coordinator's Create Project
// form (minus document uploads — those still go through My Documents). Saving
// here doesn't create a project by itself: once the coordinator opens Create
// Project for this applicant's NIC, it auto-fills from what's saved here —
// still fully editable before they actually create the project.
const FillFormPage = () => {
  const { user } = useAuth()
  const nic = user?.userId ?? '' // a loan applicant's user_id is their NIC

  const [values, setValues] = useState<ProjectValues>(buildEmptyValues())
  const [errors, setErrors] = useState<ProjectErrors>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!nic) return
    getProjectDetailsDraft(nic).then((res) => {
      if (res.form) setValues({ ...buildEmptyValues(), ...res.form.data })
      setLoading(false)
    })
  }, [nic])

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
    setNotice('')
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
    const res = await saveProjectDetailsDraft(nic, values)
    setSaving(false)
    if (!res.ok) return setServerError(res.error ?? 'Could not save the form.')
    setNotice('Sent! Your coordinator will see these details when they create your project.')
  }

  if (loading) return <p className="text-center text-sm text-emerald-200/60">Loading form…</p>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Fill <GradientText>Form</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Fill in as much as you know about the property. Your coordinator will confirm the rest
          when creating your project.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
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

        {serverError && <p className="text-center text-sm text-red-300">{serverError}</p>}
        {notice && <p className="text-center text-sm text-emerald-200">{notice}</p>}
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

export default FillFormPage
