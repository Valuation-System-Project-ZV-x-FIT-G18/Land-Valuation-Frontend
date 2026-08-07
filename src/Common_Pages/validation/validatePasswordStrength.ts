// Validation for a NEW password (account creation / change password forms).
// Requires at least 8 characters with one uppercase letter, one lowercase
// letter, one digit and one symbol. (Login uses validatePassword instead —
// existing accounts shouldn't be rejected for passwords set before this rule.)

const upper = /[A-Z]/
const lower = /[a-z]/
const digit = /\d/
const symbol = /[^A-Za-z0-9]/

export function validatePasswordStrength(value: string): string | undefined {
  if (!value) return 'Password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters.'
  if (!upper.test(value)) return 'Password must contain an uppercase letter.'
  if (!lower.test(value)) return 'Password must contain a lowercase letter.'
  if (!digit.test(value)) return 'Password must contain a digit.'
  if (!symbol.test(value)) return 'Password must contain a symbol (e.g. !@#$%).'
  return undefined
}
