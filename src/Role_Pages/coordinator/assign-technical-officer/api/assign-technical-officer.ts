import type { TechnicalOfficer } from '@/Role_Pages/coordinator/assign-technical-officer/types/assign-technical-officer'

// API calls for the Assign Technical Officer page.

// List the technical officers a valuation can be assigned to.
export async function listTechnicalOfficers(): Promise<{
  officers: TechnicalOfficer[]
  error?: string
}> {
  try {
    const res = await fetch('/api/coordinator/valuations/technical-officers')
    if (!res.ok) return { officers: [], error: 'Could not load technical officers.' }
    return await res.json()
  } catch {
    return { officers: [], error: 'Could not reach the server. Please try again.' }
  }
}

// Assign a technical officer to a valuation (updates status + notifies).
export async function assignTechnicalOfficer(
  rowId: number,
  technicalOfficerId: string,
): Promise<{ ok: boolean; projectId?: string; valuationId?: number; error?: string }> {
  try {
    const res = await fetch('/api/coordinator/valuations/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rowId, technicalOfficerId }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) {
      return {
        ok: true,
        projectId: body.projectId as string,
        valuationId: body.valuationId as number,
      }
    }
    return { ok: false, error: (body.error as string) || 'Could not assign the officer.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
