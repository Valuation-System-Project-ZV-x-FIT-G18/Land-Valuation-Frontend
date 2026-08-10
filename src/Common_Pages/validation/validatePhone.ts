// Validation for a Sri Lankan phone number entered as the 9-digit local part
// after the fixed "+94" prefix. Accepts mobile and landline numbers.

const slPhonePattern = /^[1-9]\d{8}$/

export function validatePhone(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Phone number is required.'
  if (!slPhonePattern.test(v)) {
    return 'Enter a valid Sri Lankan number: 9 digits after +94 (e.g. 771234567 or 112345678).'
  }
  return undefined
}
