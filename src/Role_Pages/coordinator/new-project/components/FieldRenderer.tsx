import FormField from '@/Common_Pages/components/ui/FormField'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import type { FieldConfig, ProjectValues } from '@/Role_Pages/coordinator/new-project/types/new-project'

// Renders a single form field from its config:
// text / number / date / textarea -> FormField, select -> SelectField.

type FieldRendererProps = {
  field: FieldConfig
  value: string
  values: ProjectValues // full form state, so a select can react to another field (e.g. District -> Province)
  error?: string
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void
  onBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
}

const FieldRenderer = ({ field, value, values, error, onChange, onBlur }: FieldRendererProps) => {
  const label = field.required ? `${field.label} *` : field.label

  if (field.type === 'select') {
    // A dependent select (e.g. District) draws its list from the parent
    // field's current value (e.g. the chosen Province) instead of a fixed list.
    const parentValue = field.optionsBy ? values[field.optionsBy.field] : undefined
    const waitingOnParent = !!field.optionsBy && !parentValue
    const choices = field.optionsBy ? (parentValue ? (field.optionsBy.map[parentValue] ?? []) : []) : (field.options ?? [])
    const parentName = field.optionsBy?.field ?? ''
    const placeholder = waitingOnParent
      ? `Select the ${parentName.charAt(0).toUpperCase()}${parentName.slice(1)} first`
      : (field.placeholder ?? 'Select…')
    const options = [{ value: '', label: placeholder }, ...choices.map((o) => ({ value: o, label: o }))]
    return (
      <SelectField
        label={label}
        name={field.name}
        value={value}
        onChange={onChange}
        options={options}
        error={error}
        disabled={waitingOnParent}
      />
    )
  }

  const inputType =
    field.type === 'date' ? 'date' : field.type === 'number' ? 'number' : 'text'

  return (
    <FormField
      label={label}
      name={field.name}
      type={inputType}
      textarea={field.type === 'textarea'}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      placeholder={field.placeholder}
    />
  )
}

export default FieldRenderer
