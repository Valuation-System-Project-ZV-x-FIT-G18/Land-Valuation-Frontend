import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { validateNIC } from '@/Common_Pages/validation/validateNIC'
import { validateEmail } from '@/Common_Pages/validation/validateEmail'
import { validateLocalPhone } from '@/Common_Pages/validation/validateLocalPhone'
import { validateDateOfBirth } from '@/Common_Pages/validation/validateDateOfBirth'
import { deriveName } from '@/Role_Pages/coordinator/register-applicant/lib/deriveName'
import { registerApplicant } from '@/Role_Pages/coordinator/register-applicant/api/register-applicant'
import NameSection from '@/Role_Pages/coordinator/register-applicant/components/sections/NameSection'
import IdentityContactSection from '@/Role_Pages/coordinator/register-applicant/components/sections/IdentityContactSection'
import type {
  RegisterApplicantValues,
  RegisterErrors,
} from '@/Role_Pages/coordinator/register-applicant/types/register-applicant'

// Registers a loan applicant. The land/address details are captured later in
// the Create Project flow, so this form only collects identity and contact.
const RegisterApplicantForm = ({ initialNic }: { initialNic: string }) => {
  const navigate = useNavigate()
  const storageKey = `registerApplicant:${initialNic || 'new'}`

  // Non-password fields persist on refresh; passwords are never stored.
  const [form, setForm] = useSessionState(storageKey, {
    fullName: '', nic: initialNic, dateOfBirth: '', phone: '', email: '',
  })
  const [pw, setPw] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)

  const values: RegisterApplicantValues = { ...form, ...pw }

  // Fill the form with sample data (testing helper). Keeps a NIC if one is
  // already set; otherwise generates a fresh 12-digit one to avoid clashes.
  const autoFill = () => {
    setForm((f) => ({
      ...f,
      fullName: 'Kamal Sunil Perera',
      nic: f.nic || '20' + String(Math.floor(1e9 + Math.random() * 9e9)),
      dateOfBirth: '1995-05-20',
      phone: '0771234567',
      email: 'test.applicant@example.com',
    }))
    setPw({ password: 'Password1', confirmPassword: 'Password1' })
    setErrors({})
  }

  // The error for a single field, given the latest values.
  const validateOne = (
    name: keyof RegisterApplicantValues,
    v: RegisterApplicantValues,
  ): string | undefined => {
    switch (name) {
      case 'fullName':
        return deriveName(v.fullName).valid ? undefined : 'Enter the full name (first and last).'
      case 'nic':
        return validateNIC(v.nic)
      case 'dateOfBirth':
        return validateDateOfBirth(v.dateOfBirth)
      case 'email':
        return validateEmail(v.email)
      case 'phone':
        return validateLocalPhone(v.phone)
      case 'password':
        return v.password.length < 8 ? 'Password must be at least 8 characters.' : undefined
      case 'confirmPassword':
        return v.confirmPassword !== v.password ? 'Passwords do not match.' : undefined
      default:
        return undefined
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const name = e.target.name as keyof RegisterApplicantValues
    let value = e.target.value
    if (name === 'phone') value = value.replace(/\D/g, '').slice(0, 10)

    if (name === 'password' || name === 'confirmPassword') {
      setPw((p) => ({ ...p, [name]: value }))
    } else {
      setForm((f) => ({ ...f, [name]: value }))
    }

    // Validate this field live, so the red message shows (and clears) as the
    // user types — not only after leaving the field.
    const next = { ...values, [name]: value }
    setErrors((p) => {
      const updated = { ...p, [name]: validateOne(name, next) }
      if (name === 'password') updated.confirmPassword = validateOne('confirmPassword', next)
      return updated
    })
    setServerError('')
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const name = e.target.name as keyof RegisterApplicantValues
    setErrors((p) => ({ ...p, [name]: validateOne(name, values) }))
  }

  const validate = (): RegisterErrors => {
    const fields: (keyof RegisterApplicantValues)[] = [
      'fullName', 'nic', 'dateOfBirth', 'email', 'phone', 'password', 'confirmPassword',
    ]
    const e: RegisterErrors = {}
    fields.forEach((n) => {
      const err = validateOne(n, values)
      if (err) e[n] = err
    })
    return e
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    const found = validate()
    if (Object.keys(found).length) return setErrors(found)
    setErrors({})
    setServerError('')
    setSubmitting(true)
    const { firstName, lastName, nameWithInitials } = deriveName(values.fullName)
    const res = await registerApplicant({
      firstName,
      lastName,
      initials: nameWithInitials,
      nic: form.nic,
      dateOfBirth: form.dateOfBirth,
      email: form.email,
      phone: form.phone,
      password: pw.password,
    })
    setSubmitting(false)
    if (!res.ok) return setServerError(res.error ?? 'Could not register the applicant.')
    sessionStorage.removeItem(storageKey)
    sessionStorage.removeItem('applicantSearchQuery') // clear the NIC on the search page
    setDone(true)
  }

  if (done) {
    const { firstName, lastName } = deriveName(values.fullName)
    return (
      <Card className="mx-auto mt-8 max-w-3xl p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">
          ✓
        </div>
        <p className="mt-4 text-2xl">
          <GradientText>Applicant Registered!</GradientText>
        </p>
        <p className="mt-2 text-emerald-100/80">
          {firstName} {lastName} has been added to the system.
        </p>
        <p className="mt-6 font-medium text-white">Create a project for this applicant?</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            type="button"
            onClick={() => navigate('/coordinator/new-project', { state: { nic: form.nic } })}
          >
            Yes, create project
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/coordinator/create-project')}
          >
            No, back to search
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="mx-auto mt-8 max-w-3xl p-6 sm:p-8">
      <div className="mb-4 text-center">
        <button
          type="button"
          onClick={autoFill}
          className="rounded-lg border border-gold-400/40 bg-gold-400/10 px-4 py-2 text-xs font-medium text-gold-200 transition hover:bg-gold-400/20"
        >
          ⚡ Auto-fill form
        </button>
      </div>
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <NameSection values={values} errors={errors} onChange={handleChange} onBlur={handleBlur} />
        <IdentityContactSection values={values} errors={errors} onChange={handleChange} onBlur={handleBlur} />

        {serverError && <p className="text-sm text-red-300">{serverError}</p>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Registering…' : 'Register applicant'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default RegisterApplicantForm
