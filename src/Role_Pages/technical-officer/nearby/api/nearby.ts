// API + types for "Analyse Nearby Lands".

export type NearbyLocation = {
  projectId: string
  propertyNumber: string
  streetName: string
  villageTown: string
  district: string
  province: string
  propertyType: string
  latitude: number | null
  longitude: number | null
  extentPerches: number
}

export type Comparable = {
  area: string
  refNo: string
  saleDate: string
  extentPerches: number
  distanceKm: number
  pricePerPerch: number
  evidenceType: string
  source: string
  note: string
}

export type AnalyseInput = {
  comparables: Comparable[]
  ratePerPerch: number
  forcedSalePct: number
  valuationDate: string
  previouslyValued: string
  marketTrend: string
}

// The generated Sections 9–13 (also the shape that gets saved/loaded).
export type Report = {
  evidence: { comparables: Comparable[]; rangeLow: number; rangeHigh: number; marketSurveyStatement: string }
  basis: { asIsNote: string; previouslyValued: string }
  calculation: { totalExtentPerches: number; ratePerPerch: number; bareLandValue: number; marketValue: number; notes: string[] }
  conclusion: { marketTrend: string; text: string }
  summary: {
    valuationDate: string
    marketValue: number
    marketValueWords: string
    forcedSalePct: number
    forcedSaleValue: number
    forcedSaleValueWords: string
  }
  aiUsed?: boolean
}

const base = '/api/technical-officer/nearby'

export async function getLocation(projectId: string): Promise<NearbyLocation | null> {
  try {
    const res = await fetch(`${base}/location?projectId=${encodeURIComponent(projectId)}`)
    const body = await res.json()
    return body.error ? null : (body as NearbyLocation)
  } catch {
    return null
  }
}

export async function getComparables(
  projectId: string,
): Promise<{ comparables: Comparable[]; aiUsed: boolean; marketTrend: string }> {
  try {
    const res = await fetch(`${base}/comparables?projectId=${encodeURIComponent(projectId)}`)
    const body = await res.json()
    return {
      comparables: body.comparables ?? [],
      aiUsed: !!body.aiUsed,
      marketTrend: body.marketTrend ?? '',
    }
  } catch {
    return { comparables: [], aiUsed: false, marketTrend: '' }
  }
}

export async function analyse(projectId: string, input: AnalyseInput): Promise<Report | { error: string }> {
  const res = await fetch(`${base}/analyse`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, input }),
  })
  return res.json()
}

export async function getAnalysis(projectId: string): Promise<Report | null> {
  try {
    const res = await fetch(`${base}?projectId=${encodeURIComponent(projectId)}`)
    const body = await res.json()
    return (body.data as Report) ?? null
  } catch {
    return null
  }
}

export async function saveAnalysis(projectId: string, data: Report): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, data }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok ? { ok: true } : { ok: false, error: body.error || 'Could not save.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}
