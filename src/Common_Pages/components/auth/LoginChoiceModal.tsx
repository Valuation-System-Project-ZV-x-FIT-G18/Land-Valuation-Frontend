import { useNavigate } from 'react-router-dom'
import Modal from '@/Common_Pages/components/ui/Modal'
import Button from '@/Common_Pages/components/ui/Button'

// Popup shown when the user clicks "Login".
// Lets them pick Internal (staff) or External (bank / loan applicant),
// then navigates to the matching login page.

type LoginChoiceModalProps = {
  open: boolean
  onClose: () => void
}

const LoginChoiceModal = ({ open, onClose }: LoginChoiceModalProps) => {
  const navigate = useNavigate()

  // Close the popup, then navigate to the chosen login page.
  const goTo = (path: string) => {
    onClose()
    navigate(path)
  }

  return (
    <Modal open={open} onClose={onClose} title="Login">
      <p className="mb-5 text-sm text-emerald-100/80">
        Choose how you want to sign in.
      </p>

      <div className="grid gap-3">
        <Button type="button" fullWidth onClick={() => goTo('/login/internal')}>
          Internal
        </Button>
        <Button
          type="button"
          variant="outline"
          fullWidth
          onClick={() => goTo('/login/external')}
        >
          External
        </Button>
      </div>
    </Modal>
  )
}

export default LoginChoiceModal
