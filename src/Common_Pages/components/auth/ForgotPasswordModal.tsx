import { useState } from 'react'
import Modal from '@/Common_Pages/components/ui/Modal'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// Email-only password recovery. The temporary password must be changed after login.
const ForgotPasswordModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Enter a valid email address.')
      return
    }

    setBusy(true)
    setError('')
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail }),
      })
      if (!response.ok) throw new Error()
      setDone(true)
    } catch {
      setError('Could not process the request. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const close = () => {
    setEmail('')
    setDone(false)
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={close}>
      {done ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl" aria-hidden="true">
            &#9993;
          </div>
          <h3 className="mt-4 text-2xl"><GradientText>Check your email</GradientText></h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100/70">
            If an account matches that email, we&apos;ve sent a temporary password. Sign in with
            your email address and the temporary password, then choose a new password.
          </p>
          <Button type="button" fullWidth className="mt-5" onClick={close}>Back to login</Button>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-bold text-white">Forgot <GradientText>Password</GradientText></h3>
          <p className="mt-1 text-sm text-emerald-100/70">
            Enter the email address registered to your account. We&apos;ll send a temporary password there.
          </p>
          <div className="mt-4">
            <FormField
              label="Email Address"
              name="email"
              type="email"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setError('') }}
              placeholder="name@example.com"
              error={error}
            />
          </div>
          <div className="mt-5 flex gap-3">
            <Button type="button" fullWidth disabled={busy} onClick={submit}>
              {busy ? 'Sending...' : 'Send temporary password'}
            </Button>
            <Button type="button" variant="outline" fullWidth disabled={busy} onClick={close}>Cancel</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default ForgotPasswordModal
