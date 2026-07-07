// Simple on-brand loading spinner. Size in Tailwind units via `size` (default 5).
// Use inside buttons, over content, or beside "Loading…" text.

type SpinnerProps = {
  size?: number
  className?: string
}

const Spinner = ({ size = 5, className = '' }: SpinnerProps) => (
  <span
    role="status"
    aria-label="Loading"
    className={`inline-block animate-spin rounded-full border-2 border-gold-300/40 border-t-gold-300 ${className}`}
    style={{ width: `${size * 0.25}rem`, height: `${size * 0.25}rem` }}
  />
)

export default Spinner
