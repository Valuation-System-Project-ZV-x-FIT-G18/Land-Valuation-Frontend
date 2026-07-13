// Validation for the Register Bank form.
// projectRef, branchCode, officerName, officerNic and contact are required.
// email is optional but validated when provided.

import type { NewBank } from '@/Role_Pages/coordinator/register-bank/api/register-bank'
import { validateEmail } from '@/Common_Pages/validation/validateEmail'
import { validateBranchCode } from '@/Common_Pages/validation/validateBranchCode'
import { validateNIC } from '@/Common_Pages/validation/validateNIC'

// Accept any Sri Lankan landline or mobile: starts with 0, 9–10 digits total.
const slNumberPattern = /^0\d{8,9}$/

export type BankErrors = Partial<Record<keyof NewBank, string>>

export function validateBank(form: NewBank): BankErrors {
  const errors: BankErrors = {}

  if (!form.bankName) errors.bankName = 'Please choose a bank.'

  if (!form.projectRef.trim()) errors.projectRef = 'Applicant NIC or Project ID is required.'

  errors.branchCode = validateBranchCode(form.branchCode)

  if (!form.officerName.trim()) errors.officerName = "Officer's name is required."
  else if (form.officerName.trim().length < 2) errors.officerName = 'Please enter at least 2 characters.'

  errors.officerNic = validateNIC(form.officerNic)

  if (!form.contact.trim()) errors.contact = 'Contact number is required.'
  else if (!slNumberPattern.test(form.contact.trim())) {
    errors.contact = 'Enter a valid Sri Lankan number (e.g. 0771234567 or 0112345678).'
  }

  if (form.email.trim()) errors.email = validateEmail(form.email)

  ;(Object.keys(errors) as (keyof BankErrors)[]).forEach((k) => {
    if (!errors[k]) delete errors[k]
  })
  return errors
}
