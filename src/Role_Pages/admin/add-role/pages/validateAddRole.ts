// Validation for the Admin > Add Role form.
// Required: role, firstName, lastName, nic, email, password.
// Bank role additionally requires bankName and branchCode.
// Optional fields (phone, postalCode, dateOfBirth, city) are validated only when filled.

import type { NewRole } from '@/Role_Pages/admin/add-role/api/add-role'
import { validateEmail } from '@/Common_Pages/validation/validateEmail'
import { validateNIC } from '@/Common_Pages/validation/validateNIC'
import { validateBranchCode } from '@/Common_Pages/validation/validateBranchCode'
import { validateLocalPhone } from '@/Common_Pages/validation/validateLocalPhone'
import { validateDateOfBirth } from '@/Common_Pages/validation/validateDateOfBirth'
import { validatePostalCode } from '@/Common_Pages/validation/validatePostalCode'
import { validateNamePart } from '@/Common_Pages/validation/validateName'
import { validateCity } from '@/Common_Pages/validation/validateCity'
import { validatePasswordStrength } from '@/Common_Pages/validation/validatePasswordStrength'

export type RoleErrors = Partial<Record<keyof NewRole, string>>

export function validateAddRole(form: NewRole): RoleErrors {
  const errors: RoleErrors = {}

  if (!form.role) errors.role = 'Please choose a role.'

  errors.firstName = validateNamePart(form.firstName, 'First name')
  errors.lastName = validateNamePart(form.lastName, 'Last name')

  errors.nic = validateNIC(form.nic)
  errors.email = validateEmail(form.email)

  if (form.phone?.trim()) errors.phone = validateLocalPhone(form.phone)
  if (form.postalCode?.trim()) errors.postalCode = validatePostalCode(form.postalCode)
  if (form.dateOfBirth?.trim() && form.role !== 'Bank') errors.dateOfBirth = validateDateOfBirth(form.dateOfBirth)
  if (form.city?.trim()) errors.city = validateCity(form.city)

  errors.password = validatePasswordStrength(form.password)

  if (form.role === 'Bank') {
    if (!form.bankName) errors.bankName = 'Please choose the bank name.'
    errors.branchCode = validateBranchCode(form.branchCode)
  }

  ;(Object.keys(errors) as (keyof RoleErrors)[]).forEach((k) => {
    if (!errors[k]) delete errors[k]
  })
  return errors
}
