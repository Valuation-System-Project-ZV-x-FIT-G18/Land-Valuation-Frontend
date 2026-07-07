// Types used by the homepage.

// The data the contact form collects.
export type ContactFormData = {
  name: string
  email: string
  phone: string
  message: string
}

// A map of field name -> error message (used while validating the form).
export type ContactErrors = Partial<Record<keyof ContactFormData, string>>
