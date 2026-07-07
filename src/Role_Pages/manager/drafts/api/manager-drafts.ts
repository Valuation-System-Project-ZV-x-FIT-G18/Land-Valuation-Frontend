// API for a manager's "Check Drafts" review workflow.

export type ManagerValuation = { valuationId: number; status: string; technicalOfficerId: string }
export type ManagerProject = {
  projectId: string
  ownerName: string
  location: string
  reviewStatus: string // draft | pending_l2 | rejected | pending_l1
  rejectReason: string
  valuations: ManagerValuation[]
}

// Friendly labels for the review states.
export const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_l3: 'Awaiting L3 check',
  pending_l2: 'Submitted to L2',
  rejected_l3: 'Sent back to L3',
  rejected_l2: 'Sent back to L2',
  rejected_to_to: 'Sent back to Officer',
  rejected_to_coordinator: 'Rejected to Coordinator',
  pending_l1: 'Submitted to L1',
  locked: '🔒 Locked',
}

export async function getAllProjects(
  level: string,
  view: 'check' | 'corrections' | 'final' = 'check',
): Promise<ManagerProject[]> {
  try {
    const res = await fetch(
      `/api/manager/drafts/projects?level=${encodeURIComponent(level)}&view=${view}`,
    )
    if (!res.ok) return []
    const body = await res.json()
    return (body.projects as ManagerProject[]) ?? []
  } catch {
    return []
  }
}

// Save the (edited) report HTML and move it to a new review status.
export async function draftAction(
  projectId: string,
  status: string,
  reportHtml?: string,
  reason = '',
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/manager/drafts/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, status, reportHtml, reason }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok ? { ok: true } : { ok: false, error: body.error || 'Action failed.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}
