import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from '@/Common_Pages/hooks/useForm'
import FormField from '@/Common_Pages/components/ui/FormField'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import ForgotPasswordModal from '@/Common_Pages/components/auth/ForgotPasswordModal'
import { validatePassword } from '@/Common_Pages/validation/validatePassword'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { submitInternalLogin } from '@/Home_Pages/internal-login/api/internal-login'

// Internal (staff) login form.
// Each role has its own ID prefix (Coordinator -> Cor001, Technical Officer -> TO001,
// Manager L1/2/3 -> ML1001 / ML2001 / ML3001). The user types only the number part.
// Role + ID survive a refresh (sessionStorage); the password is never saved.

const roles = [
  { value: 'Admin', label: 'Admin', prefix: 'Adm' },
  { value: 'Coordinator', label: 'Coordinator', prefix: 'Cor' },
  { value: 'Technical Officer', label: 'Technical Officer', prefix: 'TO' },
  { value: 'Manager L1', label: 'Manager L1', prefix: 'ML1' },
  { value: 'Manager L2', label: 'Manager L2', prefix: 'ML2' },
  { value: 'Manager L3', label: 'Manager L3', prefix: 'ML3' },
]

type LoginValues = { role: string; id: string; password: string }

const prefixOf = (role: string) => roles.find((r) => r.value === role)?.prefix ?? ''

// Validate the ID's number part (>= 3 digits) and the password.
const validateLogin = (v: LoginValues) => {
  const errs: Partial<Record<keyof LoginValues, string>> = {}
  const prefix = prefixOf(v.role)
  if (!v.id.trim()) errs.id = `${v.role} ID is required.`
  else if (!/^\d{3,}$/.test(v.id)) {
    errs.id = `Enter the number after ${prefix}, e.g. ${prefix}001.`
  }
  const pw = validatePassword(v.password)
  if (pw) errs.password = pw
  return errs
}

const InternalLoginForm = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [notice] = useState('')
  const [forgotOpen, setForgotOpen] = useState(false)

  const f = useForm<LoginValues>({
    initialValues: { role: 'Coordinator', id: '', password: '' },
    validate: validateLogin,
    storageKey: 'internalLogin', // role + id survive refresh
    excludeFromStorage: ['password'], // never persist the password
    transforms: { id: (v) => v.replace(/\D/g, '').slice(0, 4) },
    onSubmit: async (v) => {
      const res = await submitInternalLogin(prefixOf(v.role) + v.id, v.password)
      if (res.ok) {
        login(res.user) // remember the user, then go to the dashboard
        navigate('/dashboard')
        return { ok: true }
      }
      return { ok: false, error: res.error }
    },
  })

  // Clear form data when leaving the page
  useEffect(() => {
    return () => {
      try {
        sessionStorage.removeItem('internalLogin')
      } catch {
        /* ignore */
      }
    }
  }, [])

  const prefix = prefixOf(f.values.role)

  return (
    <Card className="mt-8 p-6 sm:p-8">
      <form onSubmit={f.handleSubmit} noValidate className="space-y-5">
        <SelectField
          label="Role"
          name="role"
          value={f.values.role}
          onChange={f.handleChange}
          options={roles}
        />

        <FormField
          label={`${f.values.role} ID`}
          name="id"
          prefix={prefix}
          inputMode="numeric"
          maxLength={4}
          value={f.values.id}
          onChange={f.handleChange}
          onBlur={f.handleBlur}
          error={f.errors.id}
          placeholder="001"
        />

        <FormField
          label="Password"
          name="password"
          type="password"
          value={f.values.password}
          onChange={f.handleChange}
          onBlur={f.handleBlur}
          error={f.errors.password}
          placeholder="••••••••"
        />

        {f.serverError && <p className="text-sm text-red-300">{f.serverError}</p>}
        {notice && <p className="text-sm text-emerald-200">{notice}</p>}

        <Button type="submit" fullWidth disabled={f.submitting}>
          {f.submitting ? 'Signing in…' : 'Sign In'}
        </Button>

        {/* Forgot password */}
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

export default InternalLoginForm
