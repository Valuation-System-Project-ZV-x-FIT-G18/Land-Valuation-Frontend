// Validation for the contact form.
// It composes the shared per-field validators from common/validation,
// so the rules stay identical everywhere they are used.

import { validateName } from '@/Common_Pages/validation/validateName'
import { validateEmail } from '@/Common_Pages/validation/validateEmail'
import { validatePhone } from '@/Common_Pages/validation/validatePhone'
import { validateMessage } from '@/Common_Pages/validation/validateMessage'
import type {
  ContactFormData,
  ContactErrors,
} from '@/Home_Pages/firstpage/types/home'

export function validateContact(form: ContactFormData): ContactErrors {
  const errors: ContactErrors = {}

  errors.name = validateName(form.name)
  errors.email = validateEmail(form.email)
  errors.phone = validatePhone(form.phone)
  errors.message = validateMessage(form.message, 10)

  // Drop fields that came back undefined (no error).
  ;(Object.keys(errors) as (keyof ContactErrors)[]).forEach((key) => {
    if (!errors[key]) delete errors[key]
  })

  return errors
}
