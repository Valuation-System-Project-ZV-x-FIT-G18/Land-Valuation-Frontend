// Validation for a "Password" login field.
// For login we only require that something was entered.
// Returns an error message string, or undefined when valid.

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required.'
  return undefined
}
