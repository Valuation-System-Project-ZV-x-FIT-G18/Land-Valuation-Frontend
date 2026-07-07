import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { submitChangePassword } from '@/Home_Pages/change-password/api/change-password'

// First-login change-password screen. Loan applicants land here after signing in
// with the temporary password from their welcome email; once changed, they go to
// the dashboard like every other role.
const ChangePasswordPage = () => {
  const { user, login } = useAuth()
  const navigate = useNavigate()

  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!user) return null

  const firstLogin = user.mustChangePassword

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!current || !next || !confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (next.length < 8) {
      setError('New password must be at least 8 characters.')
      return
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match.')
      return
    }
    if (next === current) {
      setError('New password must be different from the current one.')
      return
    }
    setError('')
    setSubmitting(true)
    const res = await submitChangePassword(user.userId, current, next)
    setSubmitting(false)
    if (res.ok) {
      login(res.user) // flag now false -> dashboard is unlocked
      navigate('/dashboard')
    } else {
      setError(res.error)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Change <GradientText>Password</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-sm text-emerald-100/70">
          {firstLogin
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
            onChange={(e) => { setCurrent(e.target.value); setError('') }}
            placeholder="The password from your email"
          />
          <FormField
            label="New Password"
            name="next"
            type="password"
            value={next}
            onChange={(e) => { setNext(e.target.value); setError('') }}
            placeholder="At least 8 characters"
          />
          <FormField
            label="Confirm New Password"
            name="confirm"
            type="password"
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError('') }}
            placeholder="Re-enter the new password"
          />

          {error && <p className="text-sm text-red-300">{error}</p>}

          <Button type="submit" fullWidth disabled={submitting}>
            {submitting ? 'Saving…' : 'Change Password'}
          </Button>
        </form>
      </Card>
    </div>
  )
}

export default ChangePasswordPage
