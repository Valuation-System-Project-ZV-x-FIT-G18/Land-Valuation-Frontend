// Types for the coordinator's Assign Technical Officer flow.

// A technical officer the coordinator can assign a valuation to.
export type TechnicalOfficer = {
  userId: string
  name: string
  email: string
}

// The valuation being assigned (passed from the New Valuation success popup).
export type AssignContext = {
  valuationId: number
  rowId: number
  projectId: string
  nic: string
}
