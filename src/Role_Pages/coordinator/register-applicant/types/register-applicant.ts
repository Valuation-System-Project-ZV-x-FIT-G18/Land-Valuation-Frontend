// Types for the loan applicant registration page.

// What the form collects (full name is split into parts on submit).
export type RegisterApplicantValues = {
  fullName: string
  initials: string
  nic: string
  dateOfBirth: string
  phone: string
  email: string
  password: string
  confirmPassword: string
}

// What gets sent to the backend.
export type RegisterApplicantPayload = {
  firstName: string
  lastName: string
  initials: string
  nic: string
  dateOfBirth: string
  email: string
  phone: string
  password: string
}

export type RegisterErrors = Partial<Record<keyof RegisterApplicantValues, string>>

// Props shared by the form's section components.
export type SectionProps = {
  values: RegisterApplicantValues
  errors: RegisterErrors
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void
  onBlur: (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => void
}
