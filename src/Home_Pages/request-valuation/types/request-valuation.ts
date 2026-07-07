// Types used by the request-valuation page.

// The data the valuation request form collects.
export type ValuationFormData = {
  name: string
  phone: string
  email: string
  nic: string
  message: string
}

// A map of field name -> error message (used while validating the form).
export type ValuationErrors = Partial<Record<keyof ValuationFormData, string>>
