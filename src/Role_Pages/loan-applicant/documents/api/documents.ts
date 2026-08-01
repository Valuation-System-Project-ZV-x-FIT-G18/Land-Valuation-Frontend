// API for the loan applicant's document uploads (scoped per project).

export type UploadedDoc = {
  docType: string
  fileName: string
  status: string
  createdAt: string
}

export async function getDocuments(
  nic: string,
  projectId: string,
): Promise<{ documents: UploadedDoc[]; error?: string }> {
  try {
    const res = await fetch(
      `/api/applicant/documents?nic=${encodeURIComponent(nic)}&projectId=${encodeURIComponent(projectId)}`,
    )
    if (!res.ok) return { documents: [], error: 'Could not load your documents.' }
    return await res.json()
  } catch {
    return { documents: [], error: 'Could not reach the server.' }
  }
}

export async function uploadDocument(
  nic: string,
  projectId: string,
  docType: string,
  file: File,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const form = new FormData()
    form.append('nic', nic)
    form.append('projectId', projectId)
    form.append('docType', docType)
    form.append('file', file)
    const res = await fetch('/api/applicant/documents', { method: 'POST', body: form })
    const data = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && data.ok) return { ok: true }
    return { ok: false, error: (data.error as string) || 'Could not upload the file.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

// Download URL for an uploaded document.
export function documentUrl(nic: string, projectId: string, docType: string): string {
  return `/api/applicant/documents/file?nic=${encodeURIComponent(nic)}&projectId=${encodeURIComponent(projectId)}&docType=${encodeURIComponent(docType)}`
}

// Coordinator sets a document's review status (Approved / Resubmit).
export async function setDocumentStatus(
  nic: string,
  projectId: string,
  docType: string,
  status: string,
  label: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/applicant/documents/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nic, projectId, docType, status, label }),
    })
    const data = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && data.ok) return { ok: true }
    return { ok: false, error: (data.error as string) || 'Could not update the status.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}
