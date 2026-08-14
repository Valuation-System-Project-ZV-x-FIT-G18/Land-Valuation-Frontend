// Validation for a Sri Lankan NIC number.
// Old format: 9 digits followed by V or X (e.g. 851234567V).
// New format: 12 digits (e.g. 200012345678).
// Returns an error message string, or undefined when valid.

import { NIC_MESSAGE, NIC_PATTERN } from './rules'

export function validateNIC(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'NIC number is required.'
  if (!NIC_PATTERN.test(v)) return NIC_MESSAGE
  return undefined
}
