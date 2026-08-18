import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { validateNIC } from '@/Common_Pages/validation/validateNIC'
import { validateEmail } from '@/Common_Pages/validation/validateEmail'
import { validateLocalPhone } from '@/Common_Pages/validation/validateLocalPhone'
import { namePattern } from '@/Common_Pages/validation/validateName'
import { toLocalPhone } from '@/Common_Pages/validation/rules'
import { deriveName } from '@/Role_Pages/coordinator/register-applicant/lib/deriveName'
import { registerApplicant, updateApplicant } from '@/Role_Pages/coordinator/register-applicant/api/register-applicant'
import NameSection from '@/Role_Pages/coordinator/register-applicant/components/sections/NameSection'
import IdentityContactSection from '@/Role_Pages/coordinator/register-applicant/components/sections/IdentityContactSection'
import type {
  RegisterApplicantValues,
  RegisterErrors,
} from '@/Role_Pages/coordinator/register-applicant/types/register-applicant'
import type { Applicant } from '@/Role_Pages/coordinator/create-project/types/create-project'

// Registers a loan applicant (or, in edit mode, corrects an existing one).
// The land/address details are captured later in the Create Project flow, so
// this form only collects identity and contact.
const FORM_STORAGE_KEY = 'registerApplicant:form'

type RegisterApplicantFormProps = {
  // Create mode: the NIC searched on the previous page (may be blank).
  initialNic?: string
  // Edit mode: the existing applicant whose details are being corrected.
  editApplicant?: Applicant
}

const RegisterApplicantForm = ({ initialNic = '', editApplicant }: RegisterApplicantFormProps) => {
  const navigate = useNavigate()
  const isEdit = !!editApplicant

  // Edit mode is keyed per-NIC so a refresh keeps in-progress corrections
  // without colliding with a separate "new applicant" draft.
  const storageKey = isEdit ? `registerApplicant:edit:${editApplicant?.nic}` : FORM_STORAGE_KEY
  const initialForm: RegisterApplicantValues = isEdit
    ? {
        fullName: editApplicant?.name ?? '',
        applicantBusinessName: editApplicant?.applicantBusinessName ?? '',
        nic: editApplicant?.nic ?? '',
        phone: toLocalPhone(editApplicant?.phone ?? ''),
        email: editApplicant?.email ?? '',
      }
    : { fullName: '', applicantBusinessName: '', nic: initialNic, phone: '', email: '' }

  // Kept in sessionStorage so a page refresh doesn't wipe a half-filled form.
  // It is cleared on success and when the tab is closed.
  const [form, setForm] = useSessionState(storageKey, initialForm)

  // Create mode only: prefill the NIC searched on the previous page, but only
  // when the stored form has no NIC yet — so a refresh never overwrites input.
  useEffect(() => {
    if (!isEdit && initialNic && !form.nic) setForm((f) => ({ ...f, nic: initialNic }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialNic])

  const [errors, setErrors] = useState<RegisterErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [done, setDone] = useState(false)

  const values: RegisterApplicantValues = form

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
      case 'nic':
        return validateNIC(v.nic)
      case 'email':
        return validateEmail(v.email)
      case 'phone':
        return validateLocalPhone(v.phone)
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

    setForm((f) => ({ ...f, [name]: value }))

    // Validate this field live, so the red message shows (and clears) as the
    // user types — not only after leaving the field.
    const next = { ...values, [name]: value }
    setErrors((p) => {
      const updated = { ...p, [name]: validateOne(name, next) }
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
      'fullName', 'applicantBusinessName', 'nic', 'email', 'phone',
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

    const res = isEdit
      ? await updateApplicant(editApplicant!.nic, {
          firstName,
          lastName,
          initials: nameWithInitials,
          applicantBusinessName: form.applicantBusinessName,
          email: form.email,
          phone: form.phone,
        })
      : await registerApplicant({
          firstName,
          lastName,
          initials: nameWithInitials,
          applicantBusinessName: form.applicantBusinessName,
          nic: form.nic,
          email: form.email,
          phone: form.phone,
        })
    setSubmitting(false)
    if (!res.ok) {
      const fallback = isEdit
        ? 'Could not update the applicant. Please check the entered details.'
        : 'Could not register the applicant. Please check the entered details.'
      const message = res.error ?? fallback
      const lower = message.toLowerCase()
      if (lower.includes('email')) setErrors((current) => ({ ...current, email: message }))
      else if (lower.includes('nic')) setErrors((current) => ({ ...current, nic: message }))
      else if (lower.includes('business')) {
        setErrors((current) => ({ ...current, applicantBusinessName: message }))
      } else setServerError(message)
      return
    }
    sessionStorage.removeItem('applicantSearchQuery') // clear the NIC on the search page
    sessionStorage.removeItem(storageKey) // don't carry this applicant into the next one
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
          <GradientText>{isEdit ? 'Applicant Updated!' : 'Applicant Registered!'}</GradientText>
        </p>
        <p className="mt-2 text-emerald-100/80">
          {firstName} {lastName}
          {isEdit ? "'s details have been updated." : ' has been added to the system.'}
        </p>
        {!isEdit && (
          <p className="mx-auto mt-2 max-w-md text-sm text-emerald-100/65">
            Their sign-in email and temporary password have been sent to {form.email}.
          </p>
        )}
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
        {!isEdit && (
          <button
            type="button"
            onClick={() =>
              navigate('/coordinator/edit-applicant', {
                state: {
                  applicant: {
                    name: values.fullName,
                    applicantBusinessName: form.applicantBusinessName,
                    nic: form.nic,
                    email: form.email,
                    phone: form.phone,
                  },
                },
              })
            }
            className="mt-4 text-sm font-medium text-gold-200/80 underline-offset-4 transition hover:text-gold-100 hover:underline"
          >
            Made a mistake? Edit details
          </button>
        )}
      </Card>
    )
  }

  return (
    <Card className="mx-auto mt-8 max-w-3xl p-6 sm:p-8">
      <form onSubmit={handleSubmit} noValidate autoComplete="off" className="space-y-8">
        <NameSection values={values} errors={errors} onChange={handleChange} onBlur={handleBlur} />
        <IdentityContactSection
          values={values}
          errors={errors}
          onChange={handleChange}
          onBlur={handleBlur}
          nicReadOnly={isEdit}
        />

        {serverError && <p className="text-sm text-red-300">{serverError}</p>}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting || Object.keys(validate()).length > 0}>
            {submitting
              ? isEdit ? 'Saving…' : 'Registering…'
              : isEdit ? 'Save changes' : 'Register applicant'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default RegisterApplicantForm
