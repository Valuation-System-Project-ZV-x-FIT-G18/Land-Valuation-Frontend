import { useState } from 'react'
import type { ReactNode } from 'react'

// A reusable form field: label + input (or textarea) + error message.
// Supports an optional fixed `prefix` (e.g. "+94" for phone numbers).
// Keeping this in one place means every field looks and behaves the same.

type FormFieldProps = {
  label: string
  name: string
  value: string
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  onBlur?: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
  error?: string
  type?: string
  placeholder?: string
  textarea?: boolean
  rows?: number
  prefix?: ReactNode
  maxLength?: number
  inputMode?: 'text' | 'numeric' | 'tel' | 'email'
  readOnly?: boolean
  max?: string
}

// Inner input styling (the border/ring lives on the wrapper below).
const field =
  'w-full bg-transparent px-4 py-3 text-white placeholder-emerald-200/40 outline-none'

const FormField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  placeholder,
  textarea = false,
  rows = 4,
  prefix,
  maxLength,
  inputMode,
  readOnly = false,
  max,
}: FormFieldProps) => {
  // Password fields get a show/hide (eye) toggle instead of staying masked.
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && reveal ? 'text' : type

  // Border/ring turns red when there is an error, gold otherwise.
  // Read-only (auto) fields are dimmed and not editable.
  const borderClass = error
    ? 'border-red-400/70 focus-within:border-red-400 focus-within:ring-red-400/30'
    : readOnly
      ? 'border-white/10'
      : 'border-white/15 focus-within:border-gold-400/60 focus-within:ring-gold-400/30'

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-emerald-100"
      >
        {label}
      </label>

      {/* Wrapper carries the border + focus ring so the prefix and input
          read as a single field. */}
      <div
        className={`flex items-stretch overflow-hidden rounded-xl border bg-white/5 transition focus-within:ring-2 ${borderClass}`}
      >
        {prefix && (
          <span className="flex select-none items-center border-r border-white/15 px-3 text-sm font-medium text-emerald-100/90">
            {prefix}
          </span>
        )}

        {textarea ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            rows={rows}
            placeholder={placeholder}
            className={`${field} resize-none`}
          />
        ) : (
          <input
            id={name}
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            inputMode={inputMode}
            readOnly={readOnly}
            max={max}
            className={`${field} ${readOnly ? 'cursor-default text-emerald-100/70' : ''}`}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            tabIndex={-1}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            className="flex select-none items-center px-3 text-emerald-100/60 transition hover:text-emerald-100"
          >
            {reveal ? '🙈' : '👁️'}
          </button>
        )}
      </div>

      {/* Error message (only shown when the field has an error) */}
      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  )
}

export default FormField
