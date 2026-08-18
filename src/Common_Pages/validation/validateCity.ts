// Validation for a "City" field. A city name cannot contain digits.
// Optional field — returns an error string only when a non-empty, invalid
// value is present.

import { CITY_PATTERN } from './rules'

export function validateCity(value: string): string | undefined {
  const v = value.trim()
  if (!v) return undefined
  if (!CITY_PATTERN.test(v)) return 'City cannot contain numbers.'
  return undefined
}
