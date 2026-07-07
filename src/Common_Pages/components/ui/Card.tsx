import type { ReactNode } from 'react'

// Reusable frosted "glass" card container.
// Gives a consistent panel look (border + blur + shadow) across the app.
//   hover:       adds a subtle lift + glow on hover (for clickable cards)
//   as:          render as a different element (e.g. 'button') if needed
// Pass extra classes (padding, margin, etc.) via `className`.

type CardProps = {
  children: ReactNode
  className?: string
  hover?: boolean
}

const Card = ({ children, className = '', hover = false }: CardProps) => {
  const hoverClass = hover
    ? 'card-hover hover:border-gold-400/40 hover:shadow-card-hover'
    : ''

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-emerald-950/40 shadow-card backdrop-blur-sm ${hoverClass} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
