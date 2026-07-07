// Types for the coordinator's Project Status page.

// A project row shown in the search results list.
export type ProjectRow = {
  projectId: string
  nic: string
  propertyType: string
  status: string
  createdAt: string
}

// A valuation row shown under a selected project.
//   rowId       = surrogate id (unique, used to open the status).
//   valuationId = the per-project number (1st, 2nd valuation of this land...).
export type ValuationRow = {
  rowId: number
  valuationId: number
  projectId: string
  status: string
  createdAt: string
}

// The status detail shown for a selected valuation (with its parent project).
export type StatusDetail = {
  rowId: number
  valuationId: number
  projectId: string
  nic: string
  propertyType: string
  valuationStatus: string
  projectStatus: string
  createdAt: string
}
