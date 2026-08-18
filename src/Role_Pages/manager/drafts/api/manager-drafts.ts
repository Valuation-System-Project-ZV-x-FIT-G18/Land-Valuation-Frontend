// API for a manager's "Check Drafts" review workflow.

export type ManagerValuation = { valuationId: number; status: string; technicalOfficerId: string }
export type ManagerProject = {
  projectId: string
  ownerName: string
  location: string
  reviewStatus: string // draft | pending_l2 | rejected | pending_l1
  rejectReason: string
  updatedAt?: string
  workflowActionAt?: string
  reviewType: 'new' | 'recheck'
  previousReturnReason?: string
  previousReturnedAt?: string
  valuations: ManagerValuation[]
}

export type ManagerActivity = {
  projectId: string
  action: string
  fromStatus: string
  toStatus: string
  actorUserId: string
  actorRole: string
  reason: string
  createdAt: string
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

// Badge colour per review state — shared by every manager table.
export const STATUS_TONE: Record<string, 'gold' | 'info' | 'success' | 'warning' | 'neutral'> = {
  locked: 'gold',
  pending_l2: 'info',
  pending_l1: 'info',
  rejected_l2: 'warning',
  rejected_l3: 'warning',
  rejected_to_to: 'warning',
}

// The dashboard can render before AuthProvider's fetch interceptor is installed
// after a page refresh. Attach the persisted token here so the first manager
// request is authenticated as well.
function managerFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  let accessToken = ''
  try {
    accessToken = JSON.parse(sessionStorage.getItem('accessToken') ?? '""') as string
  } catch {
    accessToken = ''
  }
  const headers = new Headers(init.headers)
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  return fetch(input, { ...init, headers })
}

// Free-text filter over a manager project list — matches Project ID, owner
// name or location, case-insensitively.
export function filterProjects(projects: ManagerProject[], query: string): ManagerProject[] {
  const q = query.trim().toLowerCase()
  if (!q) return projects
  return projects.filter(
    (p) =>
      p.projectId.toLowerCase().includes(q) ||
      p.ownerName.toLowerCase().includes(q) ||
      p.location.toLowerCase().includes(q),
  )
}

export async function getAllProjects(
  level: string,
  view: 'check' | 'corrections' | 'final' | 'approved' | 'rejected' = 'check',
  throwOnError = false,
): Promise<ManagerProject[]> {
  try {
    const res = await managerFetch(
      `/api/manager/drafts/projects?level=${encodeURIComponent(level)}&view=${view}`,
    )
    if (!res.ok) {
      if (throwOnError) throw new Error(`Could not load manager projects (${res.status}).`)
      return []
    }
    const body = await res.json()
    return (body.projects as ManagerProject[]) ?? []
  } catch (error) {
    if (throwOnError) throw error
    return []
  }
}

export async function getRecentManagerActivities(limit = 8): Promise<ManagerActivity[]> {
  const res = await managerFetch(`/api/manager/drafts/recent-activities?limit=${encodeURIComponent(limit)}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.message || body.error || 'Could not load recent manager activity.')
  return (body.activities as ManagerActivity[]) ?? []
}

// Save the (edited) report HTML and move it to a new review status.
export async function draftAction(
  projectId: string,
  status: string,
  reportHtml?: string,
  reason = '',
  valuationDate = '',
  reportPrice?: number,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await managerFetch('/api/manager/drafts/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, status, reportHtml, reason, valuationDate: valuationDate || undefined, reportPrice }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok ? { ok: true } : { ok: false, error: body.message || body.error || 'Action failed.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

export async function getDraftFields(projectId: string): Promise<{ inspectionDate: string; valuationDate: string }> {
  try {
    const res = await managerFetch(`/api/manager/drafts/fields?projectId=${encodeURIComponent(projectId)}`)
    if (!res.ok) return { inspectionDate: '', valuationDate: '' }
    return await res.json()
  } catch {
    return { inspectionDate: '', valuationDate: '' }
  }
}

export type SavedManagerReport = {
  reportHtml: string
  reviewStatus: string
  updatedAt: string
}

// Loads the canonical HTML stored in drafts.data.reportHtml through a
// manager-authorized endpoint (manager users cannot call Technical Officer APIs).
export async function getManagerReport(projectId: string): Promise<SavedManagerReport> {
  const res = await managerFetch(`/api/manager/drafts/report?projectId=${encodeURIComponent(projectId)}`)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const missingRoute = res.status === 404 && String(body.message ?? '').startsWith('Cannot GET')
    throw new Error(missingRoute
      ? 'The backend is running an older version. Restart the backend to load finalized reports.'
      : body.message || body.error || 'Could not load the saved report.')
  }
  return {
    reportHtml: typeof body.reportHtml === 'string' ? body.reportHtml : '',
    reviewStatus: typeof body.reviewStatus === 'string' ? body.reviewStatus : '',
    updatedAt: typeof body.updatedAt === 'string' ? body.updatedAt : '',
  }
}
