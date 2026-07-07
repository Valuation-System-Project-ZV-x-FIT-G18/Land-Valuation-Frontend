import { useState } from 'react'
import Modal from '@/Common_Pages/components/ui/Modal'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// Forgot-password dialog: the user enters their login ID / email / NIC; the
// server emails a new temporary password (with the login ID) to the registered
// address, which they must change right after logging in.
const ForgotPasswordModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [identifier, setIdentifier] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (!identifier.trim()) return setError('Enter your login ID, email or NIC.')
    setBusy(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      })
      if (!res.ok) throw new Error()
      setDone(true)
    } catch {
      setError('Could not process the request. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const close = () => {
    setIdentifier('')
    setDone(false)
    setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={close}>
      {done ? (
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">✉️</div>
          <h3 className="mt-4 text-2xl"><GradientText>Check your email</GradientText></h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100/70">
            If an account matches that, we've emailed a new password and your login ID to the
            registered address. Sign in with it — you'll be asked to set a new password.
          </p>
          <Button type="button" fullWidth className="mt-5" onClick={close}>Back to login</Button>
        </div>
      ) : (
        <div>
          <h3 className="text-xl font-bold text-white">Forgot <GradientText>Password</GradientText></h3>
          <p className="mt-1 text-sm text-emerald-100/70">
            Enter your login ID, email, or NIC. We'll email a new password to your registered address.
          </p>
          <div className="mt-4">
            <FormField
              label="Login ID / Email / NIC"
              name="identifier"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value); setError('') }}
              placeholder="e.g. Cor001 or you@example.com"
              error={error}
            />
          </div>
          <div className="mt-5 flex gap-3">
            <Button type="button" fullWidth disabled={busy} onClick={submit}>
              {busy ? 'Sending…' : 'Send new password'}
            </Button>
            <Button type="button" variant="outline" fullWidth disabled={busy} onClick={close}>Cancel</Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default ForgotPasswordModal
