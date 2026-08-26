import Modal from '@/Common_Pages/components/ui/Modal'
import Button from '@/Common_Pages/components/ui/Button'

// A styled "are you sure?" dialog.
//
// Use this instead of window.confirm(): the native dialog cannot be styled,
// looks like a browser warning rather than part of the product, and blocks the
// whole tab while it is open.
type ConfirmModalProps = {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmModal = ({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) => (
  <Modal open={open} onClose={onCancel} title={title}>
    <p className="text-sm leading-relaxed text-emerald-100">{message}</p>
    <div className="mt-6 flex gap-3">
      <Button type="button" variant="outline" fullWidth onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button
        type="button"
        fullWidth
        onClick={onConfirm}
        className={destructive ? '!border-red-400/50 !bg-red-500/15 !text-red-100' : ''}
      >
        {confirmLabel}
      </Button>
    </div>
  </Modal>
)

export default ConfirmModal
