// The user profile shown/edited on the Settings page.
export type Profile = {
  // Read-only identity fields.
  userId: string
  role: string
  nic: string
  // Editable personal fields.
  firstName: string
  lastName: string
  initials: string
  email: string
  phone: string
  dateOfBirth: string
  province: string
  district: string
  city: string
  postalCode: string
  address: string
}
