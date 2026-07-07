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
}

const SelectField = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  options,
  error,
}: SelectFieldProps) => {
  const borderClass = error
    ? 'border-red-400/70 focus:border-red-400 focus:ring-red-400/30'
    : 'border-white/15 focus:border-gold-400/60 focus:ring-gold-400/30'

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-emerald-100"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`w-full rounded-xl border bg-emerald-900 px-4 py-3 text-white outline-none transition focus:ring-2 ${borderClass}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-emerald-900">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  )
}

export default SelectField
