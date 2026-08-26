import Button from '@/Common_Pages/components/ui/Button'

// The one "go back a level" control for every technical-officer step.
//
// Each step had grown its own version: ghost, outline and a hand-rolled <button>
// with bespoke padding, labelled variously "Projects", "All projects",
// "Assigned projects" and "Back to projects". Reading as four different
// controls made the same action look like four different actions, so the style
// and the wording live here once.
const BackButton = ({
  onClick,
  label = 'Back to projects',
}: {
  onClick: () => void
  label?: string
}) => (
  <Button type="button" variant="outline" size="sm" onClick={onClick}>
    <span aria-hidden>&larr;</span> {label}
  </Button>
)

export default BackButton
