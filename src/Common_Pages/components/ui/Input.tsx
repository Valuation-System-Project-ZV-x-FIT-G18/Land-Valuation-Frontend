import type { InputHTMLAttributes, ReactNode } from 'react'

// Lightweight text input that matches the app's field styling (glass surface,
// gold focus ring, red error state). Unlike FormField this is unmanaged — use
// it for standalone inputs like search boxes and inline table cells, so the
// same look isn't re-written inline on every page.
//   label:  optional field label above the input
//   icon:   optional leading icon (e.g. a search glyph)
//   error:  red border + optional message below
//   sizeVariant: 'sm' for compact cells, 'md' (default) for forms
// All native input props (value, onChange, placeholder, className…) pass
// through; `className` lands on the <input> so grid/flex sizing works directly.

type InputProps = {
  label?: string
  icon?: ReactNode
  error?: string
  sizeVariant?: 'sm' | 'md'
  // Full width by default. Set false when passing a fixed width via className
  // (e.g. `w-48`), otherwise `w-full` would win over it.
  fullWidth?: boolean
} & InputHTMLAttributes<HTMLInputElement>

const pad = {
  sm: 'px-2.5 py-1.5 text-xs',
  md: 'px-4 py-3 text-sm',
}

const Input = ({
  label,
  icon,
  error,
  sizeVariant = 'md',
  fullWidth = true,
  className = '',
  id,
  name,
  ...rest
}: InputProps) => {
  const inputId = id ?? name
  // Border/ring turns red on error, gold on focus otherwise.
  const borderClass = error
    ? 'border-red-400/70 focus:border-red-400 focus:ring-red-400/30'
    : 'border-white/15 focus:border-gold-400/60 focus:ring-gold-400/30'

  const input = (
    <input
      id={inputId}
      name={name}
      className={`rounded-xl border bg-white/5 text-white placeholder-emerald-200/40 outline-none transition focus:ring-2 ${fullWidth ? 'w-full' : ''} ${pad[sizeVariant]} ${icon ? 'pl-11' : ''} ${borderClass} ${className}`}
      {...rest}
    />
  )

  // Bare input (no wrapper) when there's no label/icon/error, so callers can
  // pass layout classes (e.g. `w-48`, `sm:col-span-3`) straight to the input.
  if (!label && !icon && !error) return input

  const withIcon = icon ? (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-200/40">
        {icon}
      </span>
      {input}
    </div>
  ) : (
    input
  )

  return (
    <div>
      {label && (
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-emerald-100">
          {label}
        </label>
      )}
      {withIcon}
      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  )
}

export default Input
