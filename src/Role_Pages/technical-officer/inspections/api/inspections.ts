// API for the technical officer's site inspection (OCR + save).

export type InspectionData = Record<string, string>

// Upload the handwritten form; returns OCR-extracted draft fields (not saved).
export async function ocrInspection(
  file: File,
  projectId: string,
): Promise<{ fields: InspectionData; rawText: string; ocrError?: string }> {
  try {
    const form = new FormData()
    form.append('projectId', projectId)
    form.append('file', file)
    const res = await fetch('/api/technical-officer/inspections/ocr', {
      method: 'POST',
      body: form,
    })
    if (!res.ok) return { fields: {}, rawText: '', ocrError: 'OCR request failed.' }
    return await res.json()
  } catch {
    return { fields: {}, rawText: '', ocrError: 'Could not reach the server.' }
  }
}

// Existing saved inspection data for a project (to pre-fill).
export async function getInspection(projectId: string): Promise<InspectionData | null> {
  try {
    const res = await fetch(
      `/api/technical-officer/inspections?projectId=${encodeURIComponent(projectId)}`,
    )
    if (!res.ok) return null
    const body = await res.json()
    return (body.data as InspectionData) ?? null
  } catch {
    return null
  }
}

// Save the edited inspection.
export async function saveInspection(
  projectId: string,
  toId: string,
  data: InspectionData,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/technical-officer/inspections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, toId, data }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    return { ok: false, error: (body.error as string) || 'Could not save.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}
