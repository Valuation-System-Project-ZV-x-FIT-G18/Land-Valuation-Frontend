import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import FieldRenderer from '@/Role_Pages/coordinator/new-project/components/FieldRenderer'
import { validateField } from '@/Role_Pages/coordinator/new-project/validation/validateField'
import { projectSections } from '@/Role_Pages/coordinator/new-project/constants/projectFields'
import type { ProjectErrors, ProjectValues } from '@/Role_Pages/coordinator/new-project/types/new-project'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { getForm, submitForm } from '@/Home_Pages/messages/api/messages'
import type { ProjectDetailsForm } from '@/Home_Pages/messages/types/messages'

const isVisible = (dependsOn: { field: string; value: string } | undefined, values: ProjectValues) =>
  !dependsOn || values[dependsOn.field] === dependsOn.value

const buildEmptyValues = (): ProjectValues => {
  const v: ProjectValues = {}
  projectSections.forEach((s) => s.fields.forEach((f) => (v[f.name] = '')))
  return v
}

// Opened from a conversation's "📋 Project Details Form" message. A loan
// applicant fills it in and sends it back; the coordinator (and the applicant,
// afterwards) can view what was submitted. Same fields as Create Project,
// minus document uploads (those still go through My Documents).
const FormRequestPage = () => {
  const { formId } = useParams<{ formId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const me = user?.userId ?? ''

  const [form, setForm] = useState<ProjectDetailsForm | null>(null)
  const [loading, setLoading] = useState(true)
  const [values, setValues] = useState<ProjectValues>(buildEmptyValues())
  const [errors, setErrors] = useState<ProjectErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!formId || !me) return
    getForm(Number(formId), me).then((res) => {
      setForm(res.form)
      if (res.form) setValues({ ...buildEmptyValues(), ...res.form.data })
      setLoading(false)
    })
  }, [formId, me])

  if (loading) return <p className="text-center text-sm text-emerald-200/60">Loading form…</p>
  if (!form) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <p className="font-semibold text-gold-200">Form not found</p>
        <p className="mt-1 text-sm text-emerald-100/70">
          This form doesn&apos;t exist, or you don&apos;t have access to it.
        </p>
        <Button type="button" variant="outline" className="mt-5" onClick={() => navigate('/messages')}>
          ← Back to Messages
        </Button>
      </Card>
    )
  }

  // Editable only for the applicant it was sent to, while it's still pending.
  const editable = form.status === 'Sent' && me === form.applicantId

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
    setSubmitting(true)
    const res = await submitForm(form.id, me, values)
    setSubmitting(false)
    if (!res.ok) return setServerError(res.error ?? 'Could not submit the form.')
    setDone(true)
  }

  if (done) {
    return (
      <Card className="mx-auto mt-8 max-w-lg p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">✓</div>
        <p className="mt-4 text-2xl"><GradientText>Form Sent!</GradientText></p>
        <p className="mt-2 text-emerald-100/80">
          Your coordinator has received the filled-in project details.
        </p>
        <Button type="button" className="mt-6" onClick={() => navigate('/messages')}>
          ← Back to Messages
        </Button>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button type="button" variant="outline" onClick={() => navigate('/messages')} className="!px-5 !py-2.5 text-sm">
        ← Back to Messages
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Project Details <GradientText>Form</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          {editable
            ? 'Fill in as much as you know about the property — your coordinator will confirm the rest.'
            : form.status === 'Submitted'
              ? 'Submitted project details.'
              : 'Waiting for the applicant to fill this in.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <fieldset disabled={!editable} className="space-y-8 disabled:opacity-80">
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
          {Object.values(errors).some(Boolean) && (
            <p className="text-center text-sm text-amber-300">Please fix the highlighted fields above.</p>
          )}

          {editable && (
            <Button type="submit" fullWidth disabled={submitting}>
              {submitting ? 'Sending…' : 'Send to Coordinator'}
            </Button>
          )}
        </fieldset>
      </form>
    </div>
  )
}

export default FormRequestPage
