// Types for the config-driven Create Project (land valuation) form.

export type FieldType = 'text' | 'date' | 'number' | 'textarea' | 'select'

// One form field, described declaratively.
export type FieldConfig = {
  name: string
  label: string
  type?: FieldType // default 'text'
  options?: string[] // for type 'select'
  required?: boolean
  placeholder?: string
  // Only show/validate this field when another field has a given value.
  dependsOn?: { field: string; value: string }
}

export type SectionConfig = {
  title: string
  icon: string
  fields: FieldConfig[]
  hasMap?: boolean // render the map picker after this section's fields
}

// A document/photo upload field (Section 13).
export type UploadConfig = {
  name: string
  label: string
  accept: string
  required?: boolean
  multiple?: boolean
}

export type ProjectValues = Record<string, string>
export type ProjectFiles = Record<string, File[]>
export type ProjectErrors = Record<string, string>
