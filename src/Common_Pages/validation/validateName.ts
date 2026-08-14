// Validation for name fields (full name, first name, last name, ...).
// Reused by every form that collects a person's name.
// Names can only contain letters and single spaces between words — no digits
// or symbols. Returns an error message string, or undefined when valid.

import { NAME_PATTERN } from './rules'

export const namePattern = NAME_PATTERN

// Generic helper: `label` customises the message (e.g. "First name", "Last name").
export function validateNamePart(
  value: string,
  label = 'Name',
  { required = true, minLength = 2 }: { required?: boolean; minLength?: number } = {},
): string | undefined {
  const v = value.trim()
  if (!v) return required ? `${label} is required.` : undefined
  if (v.length < minLength) return `Please enter at least ${minLength} characters.`
  if (!namePattern.test(v)) return `${label} can only contain letters.`
  return undefined
}

// Back-compat wrapper used by the public "Full Name" forms.
export function validateName(value: string): string | undefined {
  return validateNamePart(value, 'Full name', { minLength: 2 })
}
