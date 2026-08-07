// Validation for a Sri Lankan mobile number (the 9-digit local part after
// the fixed "+94" prefix). Must be 9 digits starting 71-79. Reused by every
// form with a phone field. Returns an error message string, or undefined
// when the value is valid.

const slPhonePattern = /^7[1-9]\d{7}$/

export function validatePhone(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Phone number is required.'
  if (!slPhonePattern.test(v)) {
    return 'Enter a valid number: 9 digits starting with 7 (e.g. 771234567).'
  }
  return undefined
}
