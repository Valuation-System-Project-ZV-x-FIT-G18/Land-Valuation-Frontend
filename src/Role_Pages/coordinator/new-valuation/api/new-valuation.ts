// API calls for the New Valuation page.

// Checks whether a project exists for a NIC or project id.
export async function lookupProject(
  q: string,
): Promise<{ found: boolean; project?: { projectId: string; nic: string }; error?: string }> {
  try {
    const res = await fetch(
      `/api/coordinator/projects/lookup?q=${encodeURIComponent(q.trim())}`,
    )
    if (!res.ok) return { found: false, error: 'Lookup failed. Please try again.' }
    return await res.json()
  } catch {
    return { found: false, error: 'Could not reach the server. Please try again.' }
  }
}

// A registered bank branch (created by the admin, stored on the users table).
export type RegisteredBank = {
  bankName: string
  branchName: string
  branchCode: string
  personName: string
  designation: string
  contact: string
  email: string
}

// Fetches every admin-registered bank branch for the bank/branch dropdowns.
export async function fetchRegisteredBanks(): Promise<RegisteredBank[]> {
  try {
    const res = await fetch('/api/coordinator/banks/registered')
    if (!res.ok) return []
    const body = (await res.json()) as { banks?: RegisteredBank[] }
    return body.banks ?? []
  } catch {
    return []
  }
}

// A valuation already raised for an applicant.
export type ExistingValuation = {
  rowId: number
  valuationId: number
  projectId: string
  status: string
  createdAt: string
}

// Lists every valuation raised for an applicant NIC (across all their projects).
export async function fetchValuationsByNic(nic: string): Promise<ExistingValuation[]> {
  try {
    const res = await fetch(`/api/coordinator/valuations/by-nic?nic=${encodeURIComponent(nic.trim())}`)
    if (!res.ok) return []
    const body = (await res.json()) as { valuations?: ExistingValuation[] }
    return body.valuations ?? []
  } catch {
    return []
  }
}

// Full saved details of one valuation.
export type ValuationDetails = {
  rowId: number
  valuationId: number
  projectId: string
  nic: string
  status: string
  details: Record<string, string>
  hasRequestLetter: boolean
  createdAt: string
}

// Fetches every field saved for one valuation (to view an existing valuation).
export async function fetchValuationDetails(rowId: number): Promise<ValuationDetails | null> {
  try {
    const res = await fetch(`/api/coordinator/valuations/details?id=${rowId}`)
    if (!res.ok) return null
    const body = (await res.json()) as ValuationDetails & { error?: string }
    if (body.error) return null
    return body
  } catch {
    return null
  }
}

// Creates a valuation (multipart — includes the bank request letter file).
export async function createValuation(
  formData: FormData,
): Promise<{ ok: boolean; valuationId?: number; rowId?: number; error?: string }> {
  try {
    const res = await fetch('/api/coordinator/valuations', {
      method: 'POST',
      body: formData,
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok)
      return {
        ok: true,
        valuationId: body.valuationId as number,
        rowId: body.rowId as number,
      }
    const message = Array.isArray(body.message)
      ? body.message.join(' ')
      : (body.error as string)
    return { ok: false, error: message || 'Could not create the valuation.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
