// API + types for "GPS & Map Integration".

export type MapLocation = {
  projectId: string
  address: string
  nearestCity: string
  district: string
  latitude: number | null
  longitude: number | null
  accessDescription: string
  localityDescription: string
  accessSources: string[]
  localitySources: string[]
}

// AI/template description + the data sources that fed it.
export type GeneratedDescription = { text: string; aiUsed: boolean; sources: string[] }

const base = '/api/technical-officer/mapping'

export async function getLocation(projectId: string): Promise<MapLocation | null> {
  try {
    const res = await fetch(`${base}/location?projectId=${encodeURIComponent(projectId)}`)
    const body = await res.json()
    return body.error ? null : (body as MapLocation)
  } catch {
    return null
  }
}

async function generate(
  endpoint: 'access' | 'locality',
  projectId: string,
  lat: number,
  lng: number,
): Promise<GeneratedDescription> {
  try {
    const res = await fetch(`${base}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, lat, lng }),
    })
    if (!res.ok) return { text: '', aiUsed: false, sources: [] }
    const body = await res.json()
    return { text: body.text ?? '', aiUsed: !!body.aiUsed, sources: body.sources ?? [] }
  } catch {
    return { text: '', aiUsed: false, sources: [] }
  }
}

export const generateAccess = (projectId: string, lat: number, lng: number) =>
  generate('access', projectId, lat, lng)

export const generateLocality = (projectId: string, lat: number, lng: number) =>
  generate('locality', projectId, lat, lng)

export async function saveMap(
  projectId: string,
  lat: number,
  lng: number,
  accessDescription: string,
  localityDescription: string,
  accessSources: string[],
  localitySources: string[],
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(base, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId, lat, lng, accessDescription, localityDescription, accessSources, localitySources,
      }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok ? { ok: true } : { ok: false, error: body.error || 'Could not save.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}
