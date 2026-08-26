import { useNavigate } from 'react-router-dom'
import Modal from '@/Common_Pages/components/ui/Modal'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// Shown after a Technical Officer saves a step. Offers to continue to the next
// step in the workflow (Inspection → Site Photo → GPS → Nearby → Descriptions).
// Keeps the whole flow moving without hunting through the sidebar.
type Props = {
  open: boolean
  onClose: () => void
  nextLabel: string // e.g. "Site Photos"
  nextTo: string // route to navigate to
  projectId?: string // passed along so the next page can pre-select it
  message?: string
}

const NextStepModal = ({ open, onClose, nextLabel, nextTo, projectId, message }: Props) => {
  const navigate = useNavigate()
  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">
          ✓
        </div>
        <h3 className="mt-4 text-2xl">
          <GradientText>Saved</GradientText>
        </h3>
        <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100">
          {message ?? 'This step has been saved.'} Continue to{' '}
          <span className="font-semibold text-accent-300">{nextLabel}</span> next?
        </p>
        <div className="mt-5 flex gap-3">
          <Button
            type="button"
            fullWidth
            onClick={() => navigate(nextTo, { state: projectId ? { projectId } : undefined })}
          >
            Go to {nextLabel}
          </Button>
          <Button type="button" variant="outline" fullWidth onClick={onClose}>
            Not now
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default NextStepModal
