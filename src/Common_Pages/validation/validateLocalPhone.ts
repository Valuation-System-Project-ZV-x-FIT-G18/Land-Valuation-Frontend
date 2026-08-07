// Validation for a Sri Lankan mobile number (the 9-digit local part after
// the fixed "+94" prefix, e.g. 771234567). Must be 9 digits starting 71-79.
// Returns an error message, or undefined.

const pattern = /^7[1-9]\d{7}$/

export function validateLocalPhone(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Mobile number is required.'
  if (!pattern.test(v)) {
    return 'Enter a valid mobile number: 9 digits starting with 7 (e.g. 771234567).'
  }
  return undefined
}
