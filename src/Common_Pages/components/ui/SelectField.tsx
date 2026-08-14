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
    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-200'

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-slate-700"
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
        className={`w-full rounded-xl border bg-white px-4 py-3 text-slate-900 outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:opacity-60 ${borderClass}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-300">{error}</p>}
    </div>
  )
}

export default SelectField
