import type { ReactNode } from 'react'

// Reusable accent text used to highlight key words in headings.
// A single solid accent colour, readable on the light surface.
// on the dark green background. Change it here once and it updates everywhere.

type GradientTextProps = {
  children: ReactNode
  className?: string
}

const GradientText = ({ children, className = '' }: GradientTextProps) => {
  return (
    <span
      className={`font-bold text-accent-200 ${className}`}
    >
      {children}
    </span>
  )
}

export default GradientText
