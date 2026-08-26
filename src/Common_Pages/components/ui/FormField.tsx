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
  min?: string
  max?: string
  autoComplete?: string
  helperText?: string
  // Hard-stops browser autofill. Chrome ignores autoComplete="off" for
  // name/email/phone fields, so we render the input read-only at page load
  // (browsers never autofill a read-only field) and flip it editable the
  // moment the user focuses it. This is invisible to the user.
  preventAutofill?: boolean
  // Optional suggestion list. Renders a native datalist, so the field
  // offers a dropdown while still accepting any typed value.
  suggestions?: string[]
}

// Inner input styling (the border/ring lives on the wrapper below).
const field =
  'min-h-11 w-full bg-transparent px-3.5 py-2.5 text-[15px] text-white placeholder-emerald-100/30 outline-none'

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
  min,
  max,
  autoComplete,
  helperText,
  preventAutofill = false,
  suggestions,
}: FormFieldProps) => {
  // Password fields get a show/hide (eye) toggle instead of staying masked.
  const [reveal, setReveal] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && reveal ? 'text' : type

  // Autofill guard: locked (read-only) until the field is first focused.
  const [autofillLocked, setAutofillLocked] = useState(preventAutofill)
  const unlockAutofill = () => {
    if (autofillLocked) setAutofillLocked(false)
  }
  // Real read-only (a genuinely non-editable field) vs. the temporary
  // autofill lock — only the former should look/behave dimmed.
  const domReadOnly = readOnly || autofillLocked

  // Border/ring turns red when there is an error, accent otherwise.
  // Read-only (auto) fields are dimmed and not editable.
  const borderClass = error
    ? 'border-red-400/70 focus-within:border-red-400 focus-within:ring-red-400/30'
    : readOnly
      ? 'border-white/10'
      : 'border-white/15 focus-within:border-accent-400/60 focus-within:ring-accent-400/30'

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-emerald-50"
      >
        {label}
      </label>

      {/* Wrapper carries the border + focus ring so the prefix and input
          read as a single field. */}
      <div
        className={`flex items-stretch overflow-hidden rounded-lg border bg-surface shadow-sm transition focus-within:bg-surface focus-within:ring-2 ${borderClass}`}
      >
        {prefix && (
          <span className="flex select-none items-center border-r border-white/15 px-3 text-sm font-medium text-emerald-100">
            {prefix}
          </span>
        )}

        {textarea ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={preventAutofill ? unlockAutofill : undefined}
            onBlur={onBlur}
            rows={rows}
            readOnly={domReadOnly}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`${field} resize-none`}
          />
        ) : (
          <input
            id={name}
            type={inputType}
            name={name}
            value={value}
            onChange={onChange}
            onFocus={preventAutofill ? unlockAutofill : undefined}
            onBlur={onBlur}
            placeholder={placeholder}
            maxLength={maxLength}
            inputMode={inputMode}
            readOnly={domReadOnly}
            min={min}
            max={max}
            autoComplete={autoComplete}
            list={suggestions ? `${name}-suggestions` : undefined}
            className={`${field} ${readOnly ? 'cursor-default text-emerald-100' : ''}`}
          />
        )}

        {isPassword && (
          <button
            type="button"
            onClick={() => setReveal((r) => !r)}
            aria-label={reveal ? 'Hide password' : 'Show password'}
            aria-pressed={reveal}
            title={reveal ? 'Hide password' : 'Show password'}
            className="flex select-none items-center px-3 text-emerald-100 transition hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-400/70"
          >
            {reveal ? (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M3 3l18 18" />
                <path d="M10.6 10.7a2 2 0 002.7 2.7" />
                <path d="M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9 6 9 6a17.6 17.6 0 01-2.1 2.8" />
                <path d="M6.6 6.6C4.4 8.1 3 10 3 10s3.5 6 9 6a9.8 9.8 0 004-.8" />
              </svg>
            ) : (
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                <path d="M3 12s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
            )}
          </button>
        )}
      </div>

      {suggestions && (
        <datalist id={`${name}-suggestions`}>
          {suggestions.map((option) => (
            <option key={option} value={option} />
          ))}
        </datalist>
      )}

      {/* Error message (only shown when the field has an error) */}
      {error ? (
        <p className="mt-1.5 text-xs font-medium text-red-300">{error}</p>
      ) : helperText ? (
        <p className="mt-1.5 text-xs leading-relaxed text-emerald-100">{helperText}</p>
      ) : null}
    </div>
  )
}

export default FormField
