// Validation for a Sri Lankan phone number entered as the 9-digit local part
// after the fixed "+94" prefix. Accepts mobile and landline numbers.

import { PHONE_MESSAGE, PHONE_PATTERN } from './rules'

export function validatePhone(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Phone number is required.'
  if (!PHONE_PATTERN.test(v)) return PHONE_MESSAGE
  return undefined
}
