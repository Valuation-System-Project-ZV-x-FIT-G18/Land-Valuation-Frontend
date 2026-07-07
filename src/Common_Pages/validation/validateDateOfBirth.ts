// Validation for a date of birth.
// Must be a real date, not in the future, and at least 18 years ago.

export function validateDateOfBirth(value: string): string | undefined {
  const v = value.trim()
  if (!v) return 'Date of birth is required.'

  const dob = new Date(v)
  if (Number.isNaN(dob.getTime())) return 'Enter a valid date.'

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  if (dob > today) return 'Date of birth cannot be in the future.'

  // Work out the age in whole years.
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--

  if (age < 18) return 'Applicant must be at least 18 years old.'
  return undefined
}
