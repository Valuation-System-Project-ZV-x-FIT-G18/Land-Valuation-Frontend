// Validation for a Sri Lankan postal code (4–5 digits, optional field).
// Returns an error string only when a non-empty value is present and invalid.

export function validatePostalCode(value: string): string | undefined {
  const v = value.trim()
  if (!v) return undefined
  if (!/^\d{4,5}$/.test(v)) return 'Enter a valid postal code (4–5 digits).'
  return undefined
}
