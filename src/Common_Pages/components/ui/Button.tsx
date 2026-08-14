import type { ButtonHTMLAttributes, ReactNode } from 'react'

// Reusable button used across the app.
//   variant: 'primary' (gold CTA, default) | 'outline' | 'success' | 'danger' | 'ghost'
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
    'bg-gradient-to-r from-amber-300 to-gold-400 text-emerald-950 shadow-lg shadow-gold-500/30 hover:from-amber-200 hover:to-gold-300 hover:shadow-xl hover:shadow-gold-500/40 hover:-translate-y-0.5 focus:ring-gold-300/50',
  outline:
    'border border-white/25 bg-white/5 text-white hover:border-gold-300/60 hover:bg-white/10 focus:ring-gold-300/40',
  success:
    'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-emerald-500 hover:-translate-y-0.5 focus:ring-emerald-400/40',
  danger:
    'border border-red-400/40 bg-red-500/10 text-red-200 hover:border-red-400/70 hover:bg-red-500/20 hover:text-red-100 focus:ring-red-400/40',
  ghost:
    'text-emerald-100/80 hover:bg-white/10 hover:text-white focus:ring-white/20',
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
