// Validation for a Sri Lankan NIC number.
// Old format: 9 digits followed by V or X (e.g. 851234567V).
// New format: 12 digits (e.g. 200012345678).
// Returns an error message string, or undefined when valid.

const nicPattern = /^(\d{9}[VvXx]|\d{12})$/

export function validateNIC(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'NIC number is required.'
  if (!nicPattern.test(v)) {
    return 'Enter a valid NIC: 12 digits, or 9 digits followed by V.'
  }
  return undefined
}
