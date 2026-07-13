// Validation for the Settings / profile-edit form.
// firstName and lastName are required; email is required and must be valid.
// phone, dateOfBirth and postalCode are optional but validated if provided.

import type { Profile } from '@/Home_Pages/settings/types/settings'
import { validateEmail } from '@/Common_Pages/validation/validateEmail'
import { validateLocalPhone } from '@/Common_Pages/validation/validateLocalPhone'
import { validateDateOfBirth } from '@/Common_Pages/validation/validateDateOfBirth'
import { validatePostalCode } from '@/Common_Pages/validation/validatePostalCode'

export type SettingsErrors = Partial<Record<keyof Profile, string>>

export function validateSettings(profile: Profile): SettingsErrors {
  const errors: SettingsErrors = {}

  if (!profile.firstName.trim()) errors.firstName = 'First name is required.'
  else if (profile.firstName.trim().length < 2) errors.firstName = 'Please enter at least 2 characters.'

  if (!profile.lastName.trim()) errors.lastName = 'Last name is required.'
  else if (profile.lastName.trim().length < 2) errors.lastName = 'Please enter at least 2 characters.'

  errors.email = validateEmail(profile.email)
  if (profile.phone?.trim()) errors.phone = validateLocalPhone(profile.phone)
  if (profile.dateOfBirth?.trim()) errors.dateOfBirth = validateDateOfBirth(profile.dateOfBirth)
  if (profile.postalCode?.trim()) errors.postalCode = validatePostalCode(profile.postalCode)

  ;(Object.keys(errors) as (keyof SettingsErrors)[]).forEach((k) => {
    if (!errors[k]) delete errors[k]
  })
  return errors
}
