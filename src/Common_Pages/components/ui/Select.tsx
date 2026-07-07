import type { SelectHTMLAttributes, ReactNode } from 'react'

// Plain, unmanaged dropdown matching the app's field styling. Use it for
// standalone selects (e.g. inline table cells). For a labeled form select with
// its own error handling, use SelectField instead.
//   options: either strings, or { value, label } pairs
//   sizeVariant: 'sm' for compact cells, 'md' (default) for forms
// All native select props (value, onChange, disabled…) pass through.

type Option = string | { value: string; label: string }

type SelectProps = {
  options: Option[]
  sizeVariant?: 'sm' | 'md'
  children?: ReactNode
} & SelectHTMLAttributes<HTMLSelectElement>

const pad = {
  sm: 'px-2 py-1.5 text-xs',
  md: 'px-4 py-3 text-sm',
}

const Select = ({
  options,
  sizeVariant = 'md',
  className = '',
  ...rest
}: SelectProps) => (
  <select
    className={`rounded-xl border border-white/15 bg-emerald-900 text-white outline-none transition focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/30 ${pad[sizeVariant]} ${className}`}
    {...rest}
  >
    {options.map((o) => {
      const value = typeof o === 'string' ? o : o.value
      const label = typeof o === 'string' ? o : o.label
      return (
        <option key={value} value={value} className="bg-emerald-900">
          {label}
        </option>
      )
    })}
  </select>
)

export default Select
