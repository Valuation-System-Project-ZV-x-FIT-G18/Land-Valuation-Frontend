import type { ButtonHTMLAttributes, ReactNode } from 'react'

// Reusable button used across the app.
//   variant: 'primary' (accent CTA, default) | 'outline' | 'success' | 'danger' | 'ghost'
//   size:    'sm' | 'md' (default) | 'lg'
//   loading: shows a spinner and disables the button while an action runs
//   fullWidth: stretch to the container width
// Any normal button props (type, onClick, disabled…) pass straight through.

type ButtonProps = {
  children: ReactNode
  variant?: 'primary' | 'outline' | 'success' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
} & ButtonHTMLAttributes<HTMLButtonElement>

// Layout/shape shared by every variant (colors + padding added per size/variant).
const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60'

// Padding + text size per size option.
const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-7 py-3.5 text-base',
  lg: 'px-8 py-4 text-lg',
}

// Colors specific to each variant.
const variants = {
  primary:
    'bg-accent-500 text-paper shadow-sm hover:bg-accent-600 focus:ring-accent-500/35',
  outline:
    'border border-emerald-700 bg-surface text-white hover:bg-surface-muted focus:ring-emerald-500/25',
  success:
    'bg-emerald-500 text-paper shadow-sm hover:bg-emerald-600 focus:ring-emerald-500/35',
  danger:
    'border border-red-400 bg-red-50 text-red-700 hover:bg-red-100 focus:ring-red-400/30',
  ghost:
    'text-emerald-100 hover:bg-surface-muted hover:text-white focus:ring-emerald-500/20',
}

// Small inline spinner shown while `loading`.
const Spinner = () => (
  <span
    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
    aria-hidden="true"
  />
)

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  ...rest
}: ButtonProps) => {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export default Button
