// API for the loan applicant's own Project Details drafts (Fill Form page).
// An applicant can have more than one — e.g. two separate lands — so this is
// a LIST, not a single draft. The coordinator's Create Project page reads
// the same list to let them pick which one (if any) to start a project from.

// A document attached to a draft (same upload slots as Create Project).
export type DraftFile = { docType: string; fileName: string }

export type ProjectDetailsDraft = {
  id: number
  label: string
  status: 'Pending' | 'Used'
  data: Record<string, string>
  files: DraftFile[]
  updatedAt: string
}

export async function listDrafts(nic: string): Promise<{ drafts: ProjectDetailsDraft[] }> {
  try {
    const res = await fetch(`/api/applicant/project-details?nic=${encodeURIComponent(nic)}`)
    if (!res.ok) return { drafts: [] }
    return await res.json()
  } catch {
    return { drafts: [] }
  }
}

export async function createDraft(
  nic: string,
  label: string,
  data: Record<string, string>,
): Promise<{ ok: boolean; id?: number; error?: string }> {
  try {
    const res = await fetch('/api/applicant/project-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nic, label, data }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true, id: body.id as number }
    const message = Array.isArray(body.message) ? body.message.join(' ') : (body.error as string)
    return { ok: false, error: message || 'Could not save the form.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

export async function updateDraft(
  id: number,
  nic: string,
  label: string,
  data: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/applicant/project-details/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nic, label, data }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    const message = Array.isArray(body.message) ? body.message.join(' ') : (body.error as string)
    return { ok: false, error: message || 'Could not save the form.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

export async function deleteDraft(id: number, nic: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/applicant/project-details/${id}?nic=${encodeURIComponent(nic)}`, {
      method: 'DELETE',
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    return { ok: false, error: (body.error as string) || 'Could not delete the draft.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

// Attach (or replace) one document on a draft.
export async function uploadDraftFile(
  draftId: number,
  nic: string,
  docType: string,
  file: File,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const form = new FormData()
    form.append('nic', nic)
    form.append('docType', docType)
    form.append('file', file)
    const res = await fetch(`/api/applicant/project-details/${draftId}/file`, {
      method: 'POST',
      body: form,
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    return { ok: false, error: (body.error as string) || 'Could not upload the file.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

// Download URL for a document attached to a draft.
export function draftFileUrl(draftId: number, docType: string): string {
  return `/api/applicant/project-details/file?draftId=${draftId}&docType=${encodeURIComponent(docType)}`
}

// Coordinator calls this once a project has actually been created from the
// draft, so it isn't silently reused for a later, unrelated project.
export async function markDraftUsed(id: number): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(`/api/applicant/project-details/${id}/use`, { method: 'POST' })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    return { ok: !!(res.ok && body.ok) }
  } catch {
    return { ok: false }
  }
}
