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
import { validatePasswordStrength } from '@/Common_Pages/validation/validatePasswordStrength'
import { namePattern } from '@/Common_Pages/validation/validateName'
import { toLocalPhone } from '@/Common_Pages/validation/rules'
import { useAutoField } from '@/Common_Pages/hooks/useAutoField'
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
    fullName: '', initials: '', applicantBusinessName: '', nic: initialNic, dateOfBirth: '', phone: '', email: '',
  })
  const [pw, setPw] = useState({ password: '', confirmPassword: '' })
  const [errors, setErrors] = useState<RegisterErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)

  const values: RegisterApplicantValues = { ...form, ...pw }

  // "Name with initials" defaults from the full name but stays editable —
  // once the user types their own value, it stops auto-updating.
  const { onManualChange: onInitialsChange } = useAutoField(
    deriveName(values.fullName).nameWithInitials,
    form.initials,
    (v) => setForm((f) => ({ ...f, initials: v })),
  )

  // The error for a single field, given the latest values.
  const validateOne = (
    name: keyof RegisterApplicantValues,
    v: RegisterApplicantValues,
  ): string | undefined => {
    switch (name) {
      case 'fullName':
        if (!deriveName(v.fullName).valid) return 'Enter the full name (first and last).'
        return namePattern.test(v.fullName.trim()) ? undefined : 'Name can only contain letters.'
      case 'applicantBusinessName':
        return v.applicantBusinessName.trim().length > 150
          ? 'Business name cannot exceed 150 characters.'
          : undefined
      case 'initials':
        return v.initials.trim().length > 60
          ? 'Name with initials cannot exceed 60 characters.'
          : undefined
      case 'nic':
        return validateNIC(v.nic)
      case 'dateOfBirth':
        return validateDateOfBirth(v.dateOfBirth)
      case 'email':
        return validateEmail(v.email)
      case 'phone':
        return validateLocalPhone(v.phone)
      case 'password':
        return validatePasswordStrength(v.password)
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
    if (name === 'phone') value = toLocalPhone(value)

    if (name === 'password' || name === 'confirmPassword') {
      setPw((p) => ({ ...p, [name]: value }))
    } else if (name === 'initials') {
      onInitialsChange(value) // mark as manually edited, so it stops auto-updating
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
      'fullName', 'initials', 'applicantBusinessName', 'nic', 'dateOfBirth', 'email', 'phone', 'password', 'confirmPassword',
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
    const { firstName, lastName } = deriveName(values.fullName)
    const res = await registerApplicant({
      firstName,
      lastName,
      initials: form.initials,
      applicantBusinessName: form.applicantBusinessName,
      nic: form.nic,
      dateOfBirth: form.dateOfBirth,
      email: form.email,
      phone: form.phone,
      password: pw.password,
    })
    setSubmitting(false)
    if (!res.ok) {
      const message = res.error ?? 'Could not register the applicant. Please check the entered details.'
      const lower = message.toLowerCase()
      if (lower.includes('email')) setErrors((current) => ({ ...current, email: message }))
      else if (lower.includes('nic')) setErrors((current) => ({ ...current, nic: message }))
      else if (lower.includes('business')) {
        setErrors((current) => ({ ...current, applicantBusinessName: message }))
      } else setServerError(message)
      return
    }
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
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        <NameSection values={values} errors={errors} onChange={handleChange} onBlur={handleBlur} />
        <IdentityContactSection values={values} errors={errors} onChange={handleChange} onBlur={handleBlur} />

        {serverError && <p className="text-sm text-red-300">{serverError}</p>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || Object.keys(validate()).length > 0}>
            {submitting ? 'Registering…' : 'Register applicant'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default RegisterApplicantForm
