// Validation for an "Email Address" field. Reused by every form with an email.
// Returns an error message string, or undefined when the value is valid.

// Basic email shape: something@something.something
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Email address is required.'
  if (!emailPattern.test(v)) return 'Please enter a valid email address.'
  return undefined
}
