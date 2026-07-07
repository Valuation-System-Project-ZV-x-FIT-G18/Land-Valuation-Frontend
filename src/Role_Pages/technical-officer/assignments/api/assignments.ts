// API for a technical officer's assigned projects.

export type Assignment = {
  valuationId: number
  valuationRowId: number
  projectId: string
  status: string
  reviewStatus: string // draft review state: '', pending_l3, rejected_to_to, locked, …
  rejectReason: string // reason shown when a draft was sent back
  date: string
  time: string
  owner: {
    name: string
    nameAsPerDeed: string
    nic: string
    phone: string
    email: string
    address: string
  }
  location: {
    address: string
    gnDivision: string
    dsDivision: string
    district: string
    province: string
    postalCode: string
    latitude: string
    longitude: string
  }
  project: {
    propertyType: string
    surveyPlanNumber: string
    deedNumber: string
    landName: string
    extentPerches: string
    extentAcres: string
  }
}

export async function getAssignments(
  toId: string,
): Promise<{ assignments: Assignment[]; error?: string }> {
  try {
    const res = await fetch(
      `/api/technical-officer/assignments?toId=${encodeURIComponent(toId)}`,
    )
    if (!res.ok) return { assignments: [], error: 'Could not load your assignments.' }
    return await res.json()
  } catch {
    return { assignments: [], error: 'Could not reach the server.' }
  }
}
