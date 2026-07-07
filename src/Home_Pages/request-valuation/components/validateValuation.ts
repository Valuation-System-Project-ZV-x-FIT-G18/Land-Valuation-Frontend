// Validation for the land valuation request form.
// It composes the shared per-field validators from lib/validation,
// so the rules match the rest of the app (e.g. the same Full Name rule).

import { validateName } from '@/Common_Pages/validation/validateName'
import { validateEmail } from '@/Common_Pages/validation/validateEmail'
import { validatePhone } from '@/Common_Pages/validation/validatePhone'
import { validateMessage } from '@/Common_Pages/validation/validateMessage'
import { validateNIC } from '@/Common_Pages/validation/validateNIC'
import type {
  ValuationFormData,
  ValuationErrors,
} from '@/Home_Pages/request-valuation/types/request-valuation'

export function validateValuation(form: ValuationFormData): ValuationErrors {
  const errors: ValuationErrors = {}

  errors.name = validateName(form.name)
  errors.phone = validatePhone(form.phone)
  errors.email = validateEmail(form.email)
  errors.nic = validateNIC(form.nic)
  errors.message = validateMessage(form.message, 5)

  // Drop fields that came back undefined (no error).
  ;(Object.keys(errors) as (keyof ValuationErrors)[]).forEach((key) => {
    if (!errors[key]) delete errors[key]
  })

  return errors
}
