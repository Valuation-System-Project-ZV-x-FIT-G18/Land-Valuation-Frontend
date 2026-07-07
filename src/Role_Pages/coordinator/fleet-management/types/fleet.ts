// Types for the coordinator's Fleet Management pages.

// A technical officer's core details.
export type Officer = {
  userId: string
  nic: string
  name: string
  district: string
  phone: string
  email: string
}

export type AssignedOfficer = Officer & {
  projectId: string
  valuationRowId: number
  valuationId: number
}

export type LeaveOfficer = Officer & { reason: string }

export type RejectedItem = Officer & {
  reason: string
  projectId: string
  valuationRowId: number
}

// The officer categories shown on the fleet pages.
export type FleetOfficers = {
  all: Officer[]
  available: Officer[]
  assigned: AssignedOfficer[]
  onLeave: LeaveOfficer[]
  rejected: RejectedItem[]
}

// A valuation still waiting for a technical officer.
export type UnassignedValuation = {
  valuationRowId: number
  valuationId: number
  projectId: string
  nic: string
}

// One valuation in the search drill-down, with any existing assignment.
export type WorkValuation = {
  rowId: number
  valuationId: number
  status: string
  assigned: boolean
  officerId: string
  officerName: string
  officerPhone: string
  date: string
  time: string
}

// A project (with its valuations) returned by the work search.
export type WorkProject = {
  projectId: string
  nic: string
  ownerName: string
  valuations: WorkValuation[]
}
