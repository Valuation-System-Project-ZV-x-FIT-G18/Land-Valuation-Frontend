import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import FormField from '@/Common_Pages/components/ui/FormField'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import ForgotPasswordModal from '@/Common_Pages/components/auth/ForgotPasswordModal'
import { validateBranchCode } from '@/Common_Pages/validation/validateBranchCode'
import { validateNIC } from '@/Common_Pages/validation/validateNIC'
import { validatePassword } from '@/Common_Pages/validation/validatePassword'
import { submitExternalLogin } from '@/Home_Pages/external-login/api/external-login'

// External login form for Bank and Loan Applicant users.
// Banks sign in with a Branch Code; loan applicants sign in with their NIC.
// Role + identifier survive a refresh (sessionStorage); the password is never saved.

const roles = [
  { value: 'Bank', label: 'Bank' },
  { value: 'Loan Applicant', label: 'Loan Applicant' },
]

const ExternalLoginForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  // Persisted (role + identifier); password is kept separate so it is never stored.
  const [creds, setCreds] = useSessionState('externalLogin', {
    role: 'Bank',
    identifier: '',
  })
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({})
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  // Clear form data when leaving the page
  useEffect(() => {
    return () => {
      try {
        sessionStorage.removeItem('externalLogin')
      } catch {
        /* ignore */
      }
    }
  }, [])

  const isBank = creds.role === 'Bank'
  const idLabel = isBank ? 'Branch Code' : 'NIC Number'
  const idPlaceholder = isBank
    ? 'e.g. branch_name-branch code'
    : 'e.g. 200012345678 or 851234567V'

  const validateId = (value: string) =>
    isBank ? validateBranchCode(value) : validateNIC(value)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const name = e.target.name
    if (name === 'password') {
      setPassword(e.target.value)
    } else if (name === 'role') {
      // Switching role clears the identifier (formats differ).
      setCreds({ role: e.target.value, identifier: '' })
    } else {
      setCreds((c) => ({ ...c, identifier: e.target.value }))
    }
    setErrors({})
    setNotice('')
  }

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const name = e.target.name
    if (name === 'identifier') {
      setErrors((p) => ({ ...p, identifier: validateId(creds.identifier) }))
    } else if (name === 'password') {
      setErrors((p) => ({ ...p, password: validatePassword(password) }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next = {
      identifier: validateId(creds.identifier),
      password: validatePassword(password),
    }
    if (next.identifier || next.password) {
      setErrors(next)
      return
    }
    setErrors({})
    setNotice('')

    // Both roles log in the same way: bank uses its Branch Code as the user id,
    // a loan applicant uses their NIC. Password comes from the welcome details.
    setSubmitting(true)
    const res = await submitExternalLogin(creds.identifier, password)
    setSubmitting(false)
    if (!res.ok) {
      setErrors({ password: res.error })
      return
    }
    login(res.user)
    // First login -> force a password change; otherwise straight to the dashboard.
    navigate(res.user.mustChangePassword ? '/change-password' : '/dashboard')
  }

  return (
    <Card className="mt-8 p-6 sm:p-8">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <SelectField
          label="Role"
          name="role"
          value={creds.role}
          onChange={handleChange}
          options={roles}
        />

        <FormField
          label={idLabel}
          name="identifier"
          value={creds.identifier}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.identifier}
          placeholder={idPlaceholder}
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={password}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.password}
          placeholder="••••••••"
        />

        {notice && <p className="text-sm text-emerald-200">{notice}</p>}

        <Button type="submit" fullWidth disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign In'}
        </Button>

        <div className="pt-1 text-center text-sm">
          <button
            type="button"
            onClick={() => setForgotOpen(true)}
            className="text-emerald-200 transition hover:text-gold-300"
          >
            Forgot password?
          </button>
        </div>
      </form>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </Card>
  )
}

export default ExternalLoginForm
