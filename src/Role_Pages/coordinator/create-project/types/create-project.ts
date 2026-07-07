// Types for the coordinator's "Create Project" flow.

// A loan applicant record (stored in the users table, role 'Loan Applicant').
export type Applicant = {
  userId?: string
  name: string
  initials?: string
  nic: string
  email?: string
  phone?: string
  dateOfBirth?: string
  province?: string
  district?: string
  city?: string
  postalCode?: string
  address?: string
}

export type ApplicantSearchResult = {
  found: boolean
  applicant?: Applicant
  error?: string
}

// What the registration form collects.
export type RegisterApplicantData = {
  firstName: string
  lastName: string
  nic: string
  password: string
}
