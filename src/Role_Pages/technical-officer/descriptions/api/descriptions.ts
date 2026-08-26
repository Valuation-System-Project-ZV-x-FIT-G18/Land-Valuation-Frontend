//01
// API for the technical officer's AI-generated report descriptions.

// Section keys used everywhere in this feature.
export type SectionKey =
  | 'requestDescription'
  | 'limitations'
  | 'generalAssumptions'
  | 'situation'
  | 'extentDescription'
  | 'accessDescription'
  | 'ownershipDescription'
  | 'rentControlRegulation'
  | 'certification'
  | 'landDescription'
  | 'localityDescription'
  | 'localityFacilities'
  | 'legalParagraph'
  | 'localAuthorityTax'
  | 'streetLineBuildingLimits'
  | 'mandatoryRequirements'
  | 'conclusion'
  | 'valuation'
  | 'evidence'
  | 'imageAnalysis'

export type Descriptions = Record<SectionKey, string>

// Section 11 — Contractor's Test Method valuation figures.
export type Valuation = {
  extentText: string
  totalPerches: number
  ratePerPerch: number
  landValue: number
  buildingValue: number
  marketValue: number
  say: number
  notes: string[]
}

// Section 9 — evidence pulled from the nearby-lands analysis.
export type EvidenceComp = {
  refNo: string
  date: string
  area?: string
  note?: string
  propertyType?: string
  roadAccess?: string
  extentPerches: number
  distanceKm: number
  pricePerPerch: number
  evidenceType: string
  source: string
}
export type Evidence = { comparables: EvidenceComp[]; rangeLow: number; rangeHigh: number; hasAnalysis: boolean }

export async function getValuation(projectId: string): Promise<Valuation | null> {
  try {
    const res = await fetch(`/api/technical-officer/descriptions/valuation?projectId=${encodeURIComponent(projectId)}`)
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

export async function getEvidence(projectId: string): Promise<Evidence | null> {
  try {
    const res = await fetch(`/api/technical-officer/descriptions/evidence?projectId=${encodeURIComponent(projectId)}`)
    return res.ok ? await res.json() : null
  } catch {
    return null
  }
}

// One editable source input feeding a section.
export type SourceField = { key: string; label: string; value: string }
// A section together with the source fields that feed it.
export type SourceSection = { section: SectionKey; label: string; fields: SourceField[] }

// The editable sources per section + the list of uploaded site photos.
export async function getSources(
  projectId: string,
): Promise<{ sources: SourceSection[]; photos: string[]; error?: string }> {
  try {
    const res = await fetch(
      `/api/technical-officer/descriptions/sources?projectId=${encodeURIComponent(projectId)}`,
    )
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (!res.ok || body.error) return { sources: [], photos: [], error: (body.error as string) || 'Could not load sources.' }
    return { sources: body.sources ?? [], photos: body.photos ?? [] }
  } catch {
    return { sources: [], photos: [], error: 'Could not reach the server.' }
  }
}

// (Re)generate ONE section from the given (possibly edited) source field values.
export async function generateSection(
  projectId: string,
  section: SectionKey,
  fields: Record<string, string>,
): Promise<{ text: string; aiUsed: boolean; error?: string }> {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 20_000)
  try {
    const res = await fetch('/api/technical-officer/descriptions/generate-one', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, section, fields }),
      signal: controller.signal,
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (!res.ok) {
      return { text: '', aiUsed: false, error: (body.error as string) || 'Could not generate.' }
    }

    const text = typeof body.text === 'string' ? body.text.trim() : ''
    if (!text) {
      return {
        text: '',
        aiUsed: false,
        error: `No description was generated for ${section}. Restart the backend and try again.`,
      }
    }

    return { text, aiUsed: body.aiUsed === true }
  } catch (error) {
    return {
      text: '',
      aiUsed: false,
      error: error instanceof DOMException && error.name === 'AbortError'
        ? `Generation timed out for ${section}. Please try again.`
        : 'Could not reach the server.',
    }
  } finally {
    window.clearTimeout(timeout)
  }
}

// Project IDs whose descriptions have already been saved (drop off the to-do list).
export async function getCompletedProjects(): Promise<string[]> {
  try {
    const res = await fetch('/api/technical-officer/descriptions/completed')
    if (!res.ok) return []
    const body = await res.json()
    return (body.projectIds as string[]) ?? []
  } catch {
    return []
  }
}

// The previously saved descriptions (or null).
export async function getDescriptions(projectId: string): Promise<Descriptions | null> {
  try {
    const res = await fetch(
      `/api/technical-officer/descriptions?projectId=${encodeURIComponent(projectId)}`,
    )
    if (!res.ok) return null
    const body = await res.json()
    return (body.data as Descriptions) ?? null
  } catch {
    return null
  }
}

// Save the edited descriptions.
export async function saveDescriptions(
  projectId: string,
  data: Descriptions,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/technical-officer/descriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, data }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    return { ok: false, error: (body.error as string) || 'Could not save.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

// Generate every section in one backend request.
//
// Replaces sixteen parallel generate-one calls. The free Gemini tier allows
// roughly twenty requests per window, so the old fan-out burned the whole quota
// on a single click and every section after it silently fell back to template
// wording. The backend now asks once and saves the result.
export async function generateAllSections(projectId: string): Promise<{
  ok: boolean
  aiSections?: number
  totalSections?: number
  data?: Descriptions
  error?: string
}> {
  const controller = new AbortController()
  // One request writing sixteen paragraphs needs longer than a single section.
  const timeout = window.setTimeout(() => controller.abort(), 90_000)
  try {
    const res = await fetch('/api/technical-officer/descriptions/generate-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
      signal: controller.signal,
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (!res.ok || !body.ok) {
      return { ok: false, error: (body.error as string) || 'Could not generate the sections.' }
    }
    return {
      ok: true,
      aiSections: body.aiSections as number,
      totalSections: body.totalSections as number,
      data: body.data as Descriptions,
    }
  } catch (err) {
    return {
      ok: false,
      error: (err as Error).name === 'AbortError'
        ? 'Generating the sections took too long. Please try again.'
        : 'Could not reach the server.',
    }
  } finally {
    window.clearTimeout(timeout)
  }
}
