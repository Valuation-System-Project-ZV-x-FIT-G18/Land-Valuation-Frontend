import type {
  ProjectRow,
  ValuationRow,
  StatusDetail,
} from '@/Role_Pages/coordinator/project-status/types/project-status'

// API calls for the Project Status page.

function statusFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  let accessToken = ''
  try { accessToken = JSON.parse(sessionStorage.getItem('accessToken') ?? '""') as string }
  catch { accessToken = '' }
  const headers = new Headers(init.headers)
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`)
  return fetch(input, { ...init, headers })
}

// Search projects by NIC or Project ID (empty query returns recent projects).
export async function searchProjects(
  q: string,
): Promise<{ projects: ProjectRow[]; error?: string }> {
  try {
    const res = await statusFetch(
      `/api/coordinator/projects/status?q=${encodeURIComponent(q.trim())}`,
    )
    if (!res.ok) return { projects: [], error: 'Search failed. Please try again.' }
    return await res.json()
  } catch {
    return { projects: [], error: 'Could not reach the server. Please try again.' }
  }
}

export async function getDashboardProjects(): Promise<{ projects: ProjectRow[]; error?: string }> {
  try {
    const res = await statusFetch('/api/coordinator/projects/dashboard')
    if (!res.ok) return { projects: [], error: 'Could not load project totals.' }
    return await res.json()
  } catch {
    return { projects: [], error: 'Could not reach the server. Please try again.' }
  }
}

// List every valuation raised against a project.
export async function listValuations(
  projectId: string,
): Promise<{ valuations: ValuationRow[]; error?: string }> {
  try {
    const res = await statusFetch(
      `/api/coordinator/valuations/by-project?projectId=${encodeURIComponent(projectId)}`,
    )
    if (!res.ok) return { valuations: [], error: 'Could not load valuations.' }
    return await res.json()
  } catch {
    return { valuations: [], error: 'Could not reach the server. Please try again.' }
  }
}

// Get the status detail for one valuation (looked up by its surrogate row id).
export async function getValuationStatus(
  rowId: number,
): Promise<{ status?: StatusDetail; error?: string }> {
  try {
    const res = await statusFetch(
      `/api/coordinator/valuations/status?id=${encodeURIComponent(rowId)}`,
    )
    if (!res.ok) return { error: 'Could not load status.' }
    const body = await res.json()
    return { status: body.status as StatusDetail | undefined }
  } catch {
    return { error: 'Could not reach the server. Please try again.' }
  }
}

import type { TimelineStep } from '@/Role_Pages/coordinator/project-status/components/StatusTimeline'

// The computed lifecycle steps for a valuation.
export async function getTimeline(rowId: number): Promise<TimelineStep[]> {
  try {
    const res = await statusFetch(`/api/coordinator/valuations/timeline?id=${encodeURIComponent(String(rowId))}`)
    const body = await res.json()
    return (body.steps as TimelineStep[]) ?? []
  } catch {
    return []
  }
}

// The full lifecycle for a project (works even with no valuations yet).
export async function getProjectTimeline(projectId: string): Promise<TimelineStep[]> {
  try {
    const res = await statusFetch(`/api/coordinator/valuations/project-timeline?projectId=${encodeURIComponent(projectId)}`)
    const body = await res.json()
    return (body.steps as TimelineStep[]) ?? []
  } catch {
    return []
  }
}

export type ProjectDetails = {
  projectId: string
  applicantNic: string
  status: string
  createdAt: string
  details: Record<string, string>
  documents: { type: string; fileName: string }[]
}

// All stored details + uploaded documents for a project.
export async function getProjectDetails(projectId: string): Promise<ProjectDetails | null> {
  try {
    const res = await statusFetch(`/api/coordinator/projects/details?projectId=${encodeURIComponent(projectId)}`)
    const body = await res.json()
    return body.error ? null : (body as ProjectDetails)
  } catch {
    return null
  }
}

// URL to view an uploaded project document (opens the file inline).
export function projectFileUrl(projectId: string, type: string): string {
  return `/api/coordinator/projects/file?projectId=${encodeURIComponent(projectId)}&type=${encodeURIComponent(type)}`
}

// Format a database timestamp as a short, readable date.
export function formatDate(value: string): string {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}
