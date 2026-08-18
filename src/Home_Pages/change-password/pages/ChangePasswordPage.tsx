import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { validatePasswordStrength } from '@/Common_Pages/validation/validatePasswordStrength'
import { submitChangePassword } from '@/Home_Pages/change-password/api/change-password'

type PwErrors = { current?: string; next?: string; confirm?: string }

function validatePw(current: string, next: string, confirm: string): PwErrors {
  const e: PwErrors = {}
  if (!current) e.current = 'Current password is required.'
  const nextErr = validatePasswordStrength(next)
  if (nextErr) e.next = nextErr
  else if (next === current) e.next = 'New password must differ from the current one.'
  if (!confirm) e.confirm = 'Please confirm your new password.'
  else if (confirm !== next) e.confirm = 'Passwords do not match.'
  return e
}

// First-login change-password screen. Loan applicants land here after signing in
// with the temporary password from their welcome email; once changed, they go to
// the dashboard like every other role.
const ChangePasswordPage = () => {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<PwErrors>({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!user) return null

  const isValid = Object.keys(validatePw(current, next, confirm)).length === 0

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof PwErrors
    const found = validatePw(current, next, confirm)
    setErrors((p) => ({ ...p, [name]: found[name] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validatePw(current, next, confirm)
    if (Object.keys(found).length > 0) { setErrors(found); return }
    setErrors({})
    setServerError('')
    setSubmitting(true)
    const res = await submitChangePassword(current, next)
    setSubmitting(false)
    if (res.ok) {
      login(res.user)
      navigate('/dashboard')
    } else {
      setServerError(res.error)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Change <GradientText>Password</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-emerald-100/70">
          {user.mustChangePassword
            ? 'For your security, please set a new password before continuing.'
            : 'Update your account password.'}
        </p>
      </div>

      <Card className="mt-8 p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormField
            label="Current Password"
            name="current"
            type="password"
            value={current}
            onChange={(e) => { setCurrent(e.target.value); setErrors((p) => ({ ...p, current: undefined })); setServerError('') }}
            onBlur={handleBlur}
            error={errors.current}
            placeholder="The password from your email"
          />
          <FormField
            label="New Password"
            name="next"
            type="password"
            value={next}
            onChange={(e) => { setNext(e.target.value); setErrors((p) => ({ ...p, next: undefined, confirm: undefined })); setServerError('') }}
            onBlur={handleBlur}
            error={errors.next}
            placeholder="8+ chars, upper, lower, digit & symbol"
          />
          <FormField
            label="Confirm New Password"
            name="confirm"
            type="password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })); setServerError('') }}
            onBlur={handleBlur}
            error={errors.confirm}
            placeholder="Re-enter the new password"
          />

          {serverError && <p className="text-sm text-red-300">{serverError}</p>}

          <Button type="submit" fullWidth disabled={submitting || !isValid}>
            {submitting ? 'Saving…' : 'Change Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default ChangePasswordPage
