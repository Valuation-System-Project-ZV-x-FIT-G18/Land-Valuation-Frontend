// Reusable labeled dropdown (select) with the same look as FormField.
// Used for role selection on the login pages.

type Option = { value: string; label: string }

type SelectFieldProps = {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLSelectElement>) => void
  options: Option[]
  error?: string
  disabled?: boolean
}

const SelectField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
  disabled,
}: SelectFieldProps) => {
  const borderClass = error
    ? 'border-red-400/70 focus:border-red-400 focus:ring-red-400/30'
    : 'border-white/15 focus:border-accent-400/60 focus:ring-accent-400/30'

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-semibold text-emerald-50"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`min-h-11 w-full rounded-lg border bg-surface px-3.5 py-2.5 text-[15px] text-white shadow-sm outline-none transition focus:bg-surface focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${borderClass}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-surface">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs font-medium text-red-300">{error}</p>}
    </div>
  )
}

export default SelectField
