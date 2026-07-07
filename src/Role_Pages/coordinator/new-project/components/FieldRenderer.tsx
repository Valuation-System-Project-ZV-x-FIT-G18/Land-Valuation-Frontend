import FormField from '@/Common_Pages/components/ui/FormField'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import type { FieldConfig } from '@/Role_Pages/coordinator/new-project/types/new-project'

// Renders a single form field from its config:
// text / number / date / textarea -> FormField, select -> SelectField.

type FieldRendererProps = {
  field: FieldConfig
  value: string
  error?: string
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => void
  onBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void
}

const FieldRenderer = ({ field, value, error, onChange, onBlur }: FieldRendererProps) => {
  const label = field.required ? `${field.label} *` : field.label

  if (field.type === 'select') {
    const options = [
      { value: '', label: field.placeholder ?? 'Select…' },
      ...(field.options ?? []).map((o) => ({ value: o, label: o })),
    ]
    return (
      <SelectField
        label={label}
        name={field.name}
        value={value}
        onChange={onChange}
        options={options}
        error={error}
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
