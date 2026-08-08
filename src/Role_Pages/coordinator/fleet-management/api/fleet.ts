import type {
  FleetOfficers,
  Officer,
  UnassignedValuation,
  WorkProject,
} from '@/Role_Pages/coordinator/fleet-management/types/fleet'

// API calls for Fleet Management.

// The four categorized officer lists (available / assigned / on leave / rejected).
export async function getFleetOfficers(): Promise<
  FleetOfficers & { error?: string }
> {
  const empty = { all: [], available: [], assigned: [], onLeave: [], rejected: [] }
  try {
    const res = await fetch('/api/coordinator/fleet/officers')
    if (!res.ok) return { ...empty, error: 'Could not load officers.' }
    return await res.json()
  } catch {
    return { ...empty, error: 'Could not reach the server. Please try again.' }
  }
}

// Valuations waiting for a technical officer + officers free today.
export async function getUnassigned(): Promise<{
  valuations: UnassignedValuation[]
  officers: Officer[]
  error?: string
}> {
  try {
    const res = await fetch('/api/coordinator/fleet/unassigned')
    if (!res.ok) return { valuations: [], officers: [], error: 'Could not load work.' }
    return await res.json()
  } catch {
    return { valuations: [], officers: [], error: 'Could not reach the server.' }
  }
}

// Search work by NIC or Project ID → projects with their valuations + assignment.
export async function searchWork(
  q: string,
): Promise<{ projects: WorkProject[]; error?: string }> {
  try {
    const res = await fetch(`/api/coordinator/fleet/work?q=${encodeURIComponent(q.trim())}`)
    if (!res.ok) return { projects: [], error: 'Search failed. Please try again.' }
    return await res.json()
  } catch {
    return { projects: [], error: 'Could not reach the server. Please try again.' }
  }
}

// Assign a valuation to an officer on a date/time.
export async function assignOfficer(input: {
  valuationRowId: number
  toId: string
  date: string
  time: string
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/coordinator/fleet/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    return { ok: false, error: (body.error as string) || 'Could not assign.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

// Accept a rejection so the officer returns to the available pool.
export async function acceptRejection(
  valuationRowId: number,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/coordinator/fleet/accept-rejection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valuationRowId }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    return { ok: false, error: 'Could not accept the rejection.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

// A technical officer rejects an assigned project (with a reason).
export async function rejectAssignment(
  valuationRowId: number,
  toId: string,
  reason: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/coordinator/fleet/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valuationRowId, toId, reason }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok ? { ok: true } : { ok: false, error: body.error || 'Could not reject.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

// Attendance: a marked leave day for an officer.
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected'
export type LeaveEntry = { id: number; toId: string; name: string; reason: string; date: string; status: LeaveStatus }

export async function getLeaves(toId = ''): Promise<LeaveEntry[]> {
  try {
    const q = toId ? `?toId=${encodeURIComponent(toId)}` : ''
    const res = await fetch(`/api/coordinator/fleet/leaves${q}`)
    if (!res.ok) return []
    return (await res.json()).leaves ?? []
  } catch {
    return []
  }
}

export async function markLeave(
  toId: string,
  reason: string,
  date: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/coordinator/fleet/mark-leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toId, reason, date }),
    })
    const body = await res.json().catch(() => ({}))
    const message = Array.isArray(body.message) ? body.message.join(' ') : body.message
    return res.ok && body.ok
      ? { ok: true }
      : { ok: false, error: body.error || message || 'Could not mark leave.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

export async function removeLeave(id: number): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/coordinator/fleet/remove-leave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok ? { ok: true } : { ok: false, error: 'Could not remove leave.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

async function reviewLeave(
  endpoint: 'approve-leave' | 'reject-leave',
  id: number,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/coordinator/fleet/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok
      ? { ok: true }
      : { ok: false, error: body.error || 'Could not update leave request.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

export const approveLeave = (id: number) => reviewLeave('approve-leave', id)
export const rejectLeave = (id: number) => reviewLeave('reject-leave', id)
