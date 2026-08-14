// Validation for a NEW password (account creation / change password forms).
// Requires at least 8 characters with one uppercase letter, one lowercase
// letter, one digit and one symbol. (Login uses validatePassword instead —
// existing accounts shouldn't be rejected for passwords set before this rule.)

import { STRONG_PASSWORD_PATTERN } from './rules'

export function validatePasswordStrength(value: string): string | undefined {
  if (!value) return 'Password is required.'
  if (!STRONG_PASSWORD_PATTERN.test(value)) {
    return 'Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a digit and a symbol.'
  }
  return undefined
}
