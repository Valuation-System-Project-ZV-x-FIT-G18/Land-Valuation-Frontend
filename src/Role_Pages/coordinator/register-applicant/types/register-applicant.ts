// Types for the loan applicant registration page.

// What the form collects (full name is split into parts on submit).
export type RegisterApplicantValues = {
  fullName: string
  applicantBusinessName: string
  nic: string
  phone: string
  email: string
}

// What gets sent to the backend.
export type RegisterApplicantPayload = {
  firstName: string
  lastName: string
  initials: string
  applicantBusinessName?: string
  nic: string
  dateOfBirth?: string
  email: string
  phone: string
}

export type RegisterErrors = Partial<Record<keyof RegisterApplicantValues, string>>

// Props shared by the form's section components.
export type SectionProps = {
  values: RegisterApplicantValues
  errors: RegisterErrors
  // Edit mode locks the NIC (it's the applicant's login id and can't change).
  nicReadOnly?: boolean
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
