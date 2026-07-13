// Validation for the Admin > Add Role form.
// Required: role, firstName, lastName, nic, email, password.
// Bank role additionally requires bankName and branchCode.
// Optional fields (phone, postalCode, dateOfBirth) are validated only when filled.

import type { NewRole } from '@/Role_Pages/admin/add-role/api/add-role'
import { validateEmail } from '@/Common_Pages/validation/validateEmail'
import { validateNIC } from '@/Common_Pages/validation/validateNIC'
import { validateBranchCode } from '@/Common_Pages/validation/validateBranchCode'
import { validateLocalPhone } from '@/Common_Pages/validation/validateLocalPhone'
import { validateDateOfBirth } from '@/Common_Pages/validation/validateDateOfBirth'
import { validatePostalCode } from '@/Common_Pages/validation/validatePostalCode'

export type RoleErrors = Partial<Record<keyof NewRole, string>>

export function validateAddRole(form: NewRole): RoleErrors {
  const errors: RoleErrors = {}

  if (!form.role) errors.role = 'Please choose a role.'

  if (!form.firstName.trim()) errors.firstName = 'First name is required.'
  else if (form.firstName.trim().length < 2) errors.firstName = 'Please enter at least 2 characters.'

  if (!form.lastName.trim()) errors.lastName = 'Last name is required.'
  else if (form.lastName.trim().length < 2) errors.lastName = 'Please enter at least 2 characters.'

  errors.nic = validateNIC(form.nic)
  errors.email = validateEmail(form.email)

  if (form.phone?.trim()) errors.phone = validateLocalPhone(form.phone)
  if (form.postalCode?.trim()) errors.postalCode = validatePostalCode(form.postalCode)
  if (form.dateOfBirth?.trim() && form.role !== 'Bank') errors.dateOfBirth = validateDateOfBirth(form.dateOfBirth)

  if (!form.password) errors.password = 'Password is required.'
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters.'

  if (form.role === 'Bank') {
    if (!form.bankName) errors.bankName = 'Please choose the bank name.'
    errors.branchCode = validateBranchCode(form.branchCode)
  }

  ;(Object.keys(errors) as (keyof RoleErrors)[]).forEach((k) => {
    if (!errors[k]) delete errors[k]
  })
  return errors
}
