import Modal from '@/Common_Pages/components/ui/Modal'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// A blocking "✓ done" confirmation card, shown after an action that finishes
// a workflow step and moves away from the current page (e.g. a manager
// submitting/locking a draft). The manager must acknowledge it before
// continuing, so the confirmation can't be missed.
type Props = {
  open: boolean
  title: string
  message?: string
  closeLabel?: string
  onClose: () => void
}

const SuccessModal = ({ open, title, message, closeLabel = 'OK', onClose }: Props) => (
  <Modal open={open} onClose={onClose}>
    <div className="text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">
        ✓
      </div>
      <h3 className="mt-4 text-2xl">
        <GradientText>{title}</GradientText>
      </h3>
      {message && <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100">{message}</p>}
      <Button type="button" fullWidth className="mt-5" onClick={onClose}>
        {closeLabel}
      </Button>
    </div>
  </Modal>
)

export default SuccessModal
