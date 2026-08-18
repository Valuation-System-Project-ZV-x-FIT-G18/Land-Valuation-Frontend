// Canonical field rules for every frontend form. Keep these aligned with the
// backend's Common_Pages/validation/patterns.ts; the backend remains the final
// authority, while the frontend provides the same immediate feedback.
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const EMAIL_MESSAGE = 'Please enter a valid email address.'

// Sri Lankan national significant number (the 9 digits after +94): a current
// mobile operator prefix or an allocated geographic landline area code,
// followed by the 7-digit subscriber number.
export const PHONE_PATTERN =
  /^(?:(?:70|71|72|74|75|76|77|78)|(?:11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|81|91))\d{7}$/
export const PHONE_MESSAGE =
  'Enter a valid Sri Lankan mobile or landline number after +94 (e.g. 771234567 or 112345678).'

export const NIC_PATTERN = /^(\d{9}[VvXx]|\d{12})$/
export const NIC_MESSAGE = 'Enter a valid NIC: 12 digits, or 9 digits followed by V or X.'

export const NAME_PATTERN = /^[A-Za-z]+(?:\s[A-Za-z]+)*$/
export const CITY_PATTERN = /^\D*$/
export const POSTAL_CODE_PATTERN = /^\d{4,5}$/
export const BRANCH_CODE_PATTERN = /^[A-Za-z0-9-]+$/

export const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export function toLocalPhone(value: string): string {
  let digits = value.replace(/\D/g, '')
  if (digits.startsWith('94')) digits = digits.slice(2)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return digits.slice(0, 9)
}
