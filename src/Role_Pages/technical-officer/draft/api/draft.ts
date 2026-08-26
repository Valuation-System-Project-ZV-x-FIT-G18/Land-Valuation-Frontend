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

export type DraftVersion = {
  version: number
  event: string
  reviewStatus: string
  actorUserId: string
  actorRole: string
  reason: string
  createdAt: string
}

export async function getDraftHistory(projectId: string): Promise<DraftVersion[]> {
  try {
    const res = await fetch(`/api/technical-officer/draft/history?projectId=${encodeURIComponent(projectId)}`)
    if (!res.ok) return []
    const body = await res.json()
    return Array.isArray(body.versions) ? body.versions : []
  } catch {
    return []
  }
}

export async function autosaveReport(projectId: string, reportHtml: string): Promise<{ ok: boolean; savedAt?: string; error?: string }> {
  try {
    const res = await fetch('/api/technical-officer/draft/autosave', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, data: { reportHtml } }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok
      ? { ok: true, savedAt: body.savedAt }
      : { ok: false, error: body.message || body.error || 'Could not auto-save.' }
  } catch {
    return { ok: false, error: 'Auto-save is temporarily unavailable.' }
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

// The survey plan the coordinator attached to the project.
//
// The report used to point an <img> straight at the API, which answers 401:
// a plain image request carries no JWT header, so the survey plan was always
// missing from the report while the site photos (already fetched this way)
// appeared. Same fix as the photos — fetch it authenticated, hand the report
// an embeddable data URL.
export async function getReportSurveyPlanSource(projectId: string): Promise<string> {
  try {
    const res = await fetch(
      `/api/coordinator/projects/file?projectId=${encodeURIComponent(projectId)}&type=surveyPlan`,
    )
    if (!res.ok) return ''
    const blob = await res.blob()
    if (!blob.type.startsWith('image/')) return '' // a PDF plan cannot be inlined
    return await new Promise<string>((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result ?? ''))
      reader.onerror = () => resolve('')
      reader.readAsDataURL(blob)
    })
  } catch {
    return ''
  }
}

// Replace every /api/ image in a report with an embedded data URL.
//
// A saved report is a frozen record that a manager, and later a bank, opens
// long after the officer submitted it. Left as /api/ links the images are
// fetched by the browser as plain <img> requests, which carry no JWT, so every
// photograph and the survey plan came back 401 and the final report arrived
// with no images at all. (The PDF path got away with it because Puppeteer
// injects the header; nothing else does.)
//
// Inlining at save time also freezes the report: later edits to the photos
// cannot silently change a report that has already been reviewed.
export async function inlineReportImages(html: string): Promise<string> {
  return (await inlineReportImagesWithLinks(html)).html
}

// As above, but each embedded image also carries the link it replaced, so the
// links can be put back exactly.
//
// Site photographs run to hundreds of kilobytes each and a report carries about
// ten of them, so an inlined report is several megabytes. That is right for the
// submitted record, and quite wrong for a working draft that auto-saves every
// second and a half — hence restoreReportImageLinks below.
//
// The original link is written onto the tag rather than kept in a
// dataUrl -> link map: two photographs with identical bytes produce the same
// data URL, and such a map would collapse them onto one entry and hand both
// images back the same link.
export async function inlineReportImagesWithLinks(
  html: string,
): Promise<{ html: string; links: Record<string, string> }> {
  const links: Record<string, string> = {}
  const sources = [...new Set(
    [...html.matchAll(/<img[^>]+src="(\/api\/[^"]+)"/g)].map((m) => m[1]),
  )]
  if (sources.length === 0) return { html, links }

  const decode = (value: string) => value.replace(/&amp;/g, '&')
  const replacements = await Promise.all(sources.map(async (src) => {
    try {
      const res = await fetch(decode(src))
      if (!res.ok) return null
      const blob = await res.blob()
      if (!blob.type.startsWith('image/')) return null
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ''))
        reader.onerror = () => resolve('')
        reader.readAsDataURL(blob)
      })
      return dataUrl ? ([src, dataUrl] as const) : null
    } catch {
      return null
    }
  }))

  let result = html
  for (const entry of replacements) {
    if (!entry) continue // unreachable image: leave the link and its onerror text
    const [src, dataUrl] = entry
    result = result.split(`src="${src}"`).join(`src="${dataUrl}" data-report-src="${src}"`)
    links[src] = dataUrl
  }
  return { html: result, links }
}

// Swap embedded images back for the links they came from, so the working draft
// stored on every auto-save stays small. Driven by the marker written above, so
// it is unaffected by two images happening to share the same bytes.
export function restoreReportImageLinks(html: string): string {
  return html.replace(
    /src="data:[^"]*"\s+data-report-src="([^"]*)"/g,
    (_match, original: string) => `src="${original}"`,
  )
}
