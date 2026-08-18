import type { FieldConfig } from '@/Role_Pages/coordinator/new-project/types/new-project'
import { validateEmail } from '@/Common_Pages/validation/validateEmail'
import { validatePhone } from '@/Common_Pages/validation/validatePhone'
import { validatePostalCode } from '@/Common_Pages/validation/validatePostalCode'

// Validates ONE config-driven form field (used by Create Project and New
// Valuation). Returns an error message, or undefined when the value is valid.
//
// Rules are inferred so we don't have to annotate all ~65 fields:
//  - required  -> must not be empty
//  - optional & empty -> always valid
//  - name has "email"          -> email format
//  - name has "phone"/"contact"-> contact-number format
//  - type "number"             -> a non-negative number (percent <= 100)
//  - type "date"               -> a real date, not in the future

export function validateField(field: FieldConfig, value: string): string | undefined {
  const v = (value ?? '').trim()

  // Required fields must have a value; optional empty fields are fine.
  if (field.required && !v) return 'This field is required.'
  if (!v) return undefined

  const name = field.name.toLowerCase()

  // Email address fields.
  if (name.includes('email')) return validateEmail(v)

  // Phone / contact-number fields.
  if (name.includes('phone') || name.includes('contact')) {
    return validatePhone(v)
  }

  if (name.includes('postalcode')) return validatePostalCode(v)

  // Numeric fields.
  if (field.type === 'number') {
    const n = Number(v)
    if (!Number.isFinite(n)) return 'Enter a valid number.'
    if (n < 0) return 'Value cannot be negative.'
    if (name.includes('coverage') && n > 100) return 'Percentage cannot exceed 100.'
    return undefined
  }

  // Date fields — must be a real date and not in the future.
  if (field.type === 'date') {
    const d = new Date(v)
    if (isNaN(d.getTime())) return 'Enter a valid date.'
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)
    if (d.getTime() > endOfToday.getTime()) return 'Date cannot be in the future.'
    return undefined
  }

  return undefined
}
