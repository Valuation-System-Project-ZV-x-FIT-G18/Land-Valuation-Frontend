//01
// API for the technical officer's valuation-report draft.

// The mapped field values (every #N placeholder's data), used to render the report.
export async function getBuildValues(projectId: string): Promise<Record<string, string> | null> {
  try {
    const res = await fetch(`/api/technical-officer/draft/build?projectId=${encodeURIComponent(projectId)}`)
    const body = await res.json()
    return body.error ? null : (body as Record<string, string>)
  } catch {
    return null
  }
}

// The previously saved (edited) report HTML, or null.
export async function getSavedReport(projectId: string): Promise<string | null> {
  try {
    const res = await fetch(`/api/technical-officer/draft?projectId=${encodeURIComponent(projectId)}`)
    if (!res.ok) return null
    const body = await res.json()
    return (body.data?.reportHtml as string) ?? null
  } catch {
    return null
  }
}

export async function saveReport(projectId: string, reportHtml: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/technical-officer/draft', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, data: { reportHtml } }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok ? { ok: true } : { ok: false, error: body.error || 'Could not save.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

export async function downloadTemplateReport(projectId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/technical-officer/draft/word?projectId=${encodeURIComponent(projectId)}`)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { ok: false, error: body.error || 'Could not generate the Word report.' }
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Valuation-Report-${projectId}.docx`
    link.click()
    URL.revokeObjectURL(url)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

export async function downloadReportPdf(
  projectId: string,
  type: 'draft' | 'final',
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/technical-officer/draft/pdf?projectId=${encodeURIComponent(projectId)}&type=${type}`)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { ok: false, error: body.message || body.error || 'Could not generate the PDF.' }
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = type === 'draft' ? `Draft-Report-${projectId}.pdf` : `Final-Valuation-Report-${projectId}.pdf`
    link.click()
    URL.revokeObjectURL(url)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not reach the PDF service.' }
  }
}
