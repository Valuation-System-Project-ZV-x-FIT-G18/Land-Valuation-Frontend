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
    ? 'card-hover hover:border-blue-300 hover:shadow-lg'
    : ''

  return (
    <div
      className={`rounded-2xl border border-slate-300/80 bg-white/95 shadow-[0_8px_24px_-16px_rgba(15,39,71,0.45)] ${hoverClass} ${className}`}
    >
      {children}
    </div>
  )
}

export default Card
