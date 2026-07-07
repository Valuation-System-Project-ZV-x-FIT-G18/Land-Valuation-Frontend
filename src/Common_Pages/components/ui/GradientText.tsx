import type { ReactNode } from 'react'

// Reusable accent text used to highlight key words in headings.
// A bright amber -> gold gradient: creative but still clearly readable
// on the dark green background. Change it here once and it updates everywhere.

type GradientTextProps = {
  children: ReactNode
  className?: string
}

const GradientText = ({ children, className = '' }: GradientTextProps) => {
  return (
    <span
      className={`bg-gradient-to-r from-amber-200 via-gold-200 to-amber-400 bg-clip-text font-bold text-transparent ${className}`}
    >
      {children}
    </span>
  )
}

export default GradientText
