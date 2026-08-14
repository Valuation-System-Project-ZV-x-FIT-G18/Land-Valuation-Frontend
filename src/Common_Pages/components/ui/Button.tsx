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
  'group relative inline-flex items-center justify-center gap-2 rounded-xl border border-transparent font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-55'

// Padding + text size per size option.
const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-7 py-3.5 text-base',
  lg: 'px-8 py-4 text-lg',
}

// Colors specific to each variant.
const variants = {
  primary:
    'bg-gradient-to-r from-blue-700 to-blue-600 text-white shadow-md shadow-blue-900/15 hover:from-blue-800 hover:to-blue-700 hover:-translate-y-0.5 focus:ring-blue-300',
  outline:
    'border border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-800 focus:ring-blue-200',
  success:
    'bg-emerald-700 text-white shadow-sm hover:bg-emerald-800 hover:-translate-y-0.5 focus:ring-emerald-300',
  danger:
    'border-red-300 bg-white text-red-700 hover:border-red-500 hover:bg-red-50 focus:ring-red-200',
  ghost:
    'text-slate-600 hover:bg-blue-50 hover:text-blue-800 focus:ring-blue-100',
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
