// Validation for an "Email Address" field. Reused by every form with an email.
// Returns an error message string, or undefined when the value is valid.

import { EMAIL_MESSAGE, EMAIL_PATTERN } from './rules'

export function validateEmail(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Email address is required.'
  if (!EMAIL_PATTERN.test(v)) return EMAIL_MESSAGE
  return undefined
}
