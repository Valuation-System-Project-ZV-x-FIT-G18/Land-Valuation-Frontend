// Validation for a Sri Lankan mobile number in local format (e.g. 0771234567).
// Must be 10 digits starting with "07". Returns an error message, or undefined.

const pattern = /^07\d{8}$/

export function validateLocalPhone(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Mobile number is required.'
  if (!pattern.test(v)) {
    return 'Enter a valid mobile number: 10 digits starting 07 (e.g. 0771234567).'
  }
  return undefined
}
