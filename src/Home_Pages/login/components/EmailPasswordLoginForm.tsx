import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import FormField from '@/Common_Pages/components/ui/FormField'
import Button from '@/Common_Pages/components/ui/Button'
import ForgotPasswordModal from '@/Common_Pages/components/auth/ForgotPasswordModal'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { validatePassword } from '@/Common_Pages/validation/validatePassword'
import { submitLogin } from '@/Home_Pages/login/api/login'

type Props = { allowedRoles: string[]; portalName: string }

const EmailPasswordLoginForm = ({ allowedRoles, portalName }: Props) => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [submitting, setSubmitting] = useState(false)
  const [forgotOpen, setForgotOpen] = useState(false)

  const validateEmail = (value: string) => {
    if (!value.trim()) return 'Email address is required.'
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Enter a valid email address.'
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const next = { email: validateEmail(email), password: validatePassword(password) }
    if (next.email || next.password) { setErrors(next); return }
    setErrors({})
    setSubmitting(true)
    const result = await submitLogin(email, password)
    setSubmitting(false)
    if (!result.ok) { setErrors({ password: result.error }); return }
    if (!allowedRoles.includes(result.user.role)) {
      setErrors({ email: `This account cannot use the ${portalName} portal.` })
      return
    }
    login(result.user, result.accessToken)
    navigate(result.user.mustChangePassword ? '/change-password' : '/dashboard')
  }

  return (
    <Card className="mt-8 p-6 sm:p-8">
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <FormField label="Email Address" name="email" type="email" value={email}
          onChange={(event) => { setEmail(event.target.value); setErrors({}) }}
          onBlur={() => setErrors((current) => ({ ...current, email: validateEmail(email) }))}
          error={errors.email} placeholder="name@example.com" />
        <FormField label="Password" name="password" type="password" value={password}
          onChange={(event) => { setPassword(event.target.value); setErrors({}) }}
          onBlur={() => setErrors((current) => ({ ...current, password: validatePassword(password) }))}
          error={errors.password} placeholder="Enter your password" />
        <Button type="submit" fullWidth disabled={submitting}>{submitting ? 'Signing in…' : 'Sign In'}</Button>
        <div className="pt-1 text-center text-sm">
          <button type="button" onClick={() => setForgotOpen(true)} className="text-emerald-200 transition hover:text-gold-300">Forgot password?</button>
        </div>
      </form>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </Card>
  )
}

export default EmailPasswordLoginForm
