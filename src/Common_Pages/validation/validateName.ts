// Validation for a "Full Name" field. Reused by every form that has a name.
// Returns an error message string, or undefined when the value is valid.

export function validateName(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Full name is required.'
  if (v.length < 2) return 'Please enter at least 2 characters.'
  return undefined
}
