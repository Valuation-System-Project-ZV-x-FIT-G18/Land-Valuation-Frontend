// Validation for the Settings / profile-edit form.
// firstName and lastName are required; email is required and must be valid.
// phone, dateOfBirth and postalCode are optional but validated if provided.

import type { Profile } from '@/Home_Pages/settings/types/settings'
import { validateEmail } from '@/Common_Pages/validation/validateEmail'
import { validateLocalPhone } from '@/Common_Pages/validation/validateLocalPhone'
import { validateDateOfBirth } from '@/Common_Pages/validation/validateDateOfBirth'
import { validatePostalCode } from '@/Common_Pages/validation/validatePostalCode'
import { validateNamePart } from '@/Common_Pages/validation/validateName'
import { validateCity } from '@/Common_Pages/validation/validateCity'

export type SettingsErrors = Partial<Record<keyof Profile, string>>

export function validateSettings(profile: Profile): SettingsErrors {
  const errors: SettingsErrors = {}

  errors.firstName = validateNamePart(profile.firstName, 'First name')
  errors.lastName = validateNamePart(profile.lastName, 'Last name')

  errors.email = validateEmail(profile.email)
  if (profile.phone?.trim()) errors.phone = validateLocalPhone(profile.phone)
  if (profile.dateOfBirth?.trim()) errors.dateOfBirth = validateDateOfBirth(profile.dateOfBirth)
  if (profile.postalCode?.trim()) errors.postalCode = validatePostalCode(profile.postalCode)
  if (profile.city?.trim()) errors.city = validateCity(profile.city)

  ;(Object.keys(errors) as (keyof SettingsErrors)[]).forEach((k) => {
    if (!errors[k]) delete errors[k]
  })
  return errors
}
