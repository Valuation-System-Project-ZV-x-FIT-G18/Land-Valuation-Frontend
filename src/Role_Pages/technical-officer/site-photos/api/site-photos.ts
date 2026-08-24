// API for the technical officer's site photos.

export type UploadedPhoto = { photoType: string; fileName: string; description?: string; createdAt: string }

export async function getPhotos(
  projectId: string,
): Promise<{ photos: UploadedPhoto[]; error?: string }> {
  try {
    const res = await fetch(
      `/api/technical-officer/site-photos?projectId=${encodeURIComponent(projectId)}`,
    )
    if (!res.ok) return { photos: [], error: 'Could not load photos.' }
    return await res.json()
  } catch {
    return { photos: [], error: 'Could not reach the server.' }
  }
}

export async function uploadPhoto(
  projectId: string,
  toId: string,
  photoType: string,
  file: File,
  describe = false,
  photoLabel = '',
): Promise<{ ok: boolean; error?: string; description?: string }> {
  try {
    const form = new FormData()
    form.append('projectId', projectId)
    form.append('toId', toId)
    form.append('photoType', photoType)
    form.append('describe', describe ? 'true' : 'false')
    form.append('photoLabel', photoLabel)
    form.append('file', file)
    const res = await fetch('/api/technical-officer/site-photos', { method: 'POST', body: form })
    const data = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && data.ok) return { ok: true, description: (data.description as string) ?? '' }
    return { ok: false, error: (data.error as string) || 'Could not upload the photo.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

// URL to view an uploaded photo (cache-busted so a replacement shows immediately).
export function photoUrl(projectId: string, photoType: string, bust = ''): string {
  const b = bust ? `&t=${encodeURIComponent(bust)}` : ''
  return `/api/technical-officer/site-photos/file?projectId=${encodeURIComponent(projectId)}&photoType=${encodeURIComponent(photoType)}${b}`
}

const reportPhotoKeys: Record<string, string> = {
  accessRoad: 'photoAccessRoad', routeFromMainRoad: 'photoRouteFromMainRoad',
  frontView: 'photoFrontView', rearView: 'photoRearView', leftSideView: 'photoLeftSide',
  rightSideView: 'photoRightSide', northBoundary: 'photoNorthBoundary',
  eastBoundary: 'photoEastBoundary', southBoundary: 'photoSouthBoundary',
  westBoundary: 'photoWestBoundary', gateEntrance: 'photoGateEntrance',
  drainage: 'photoDrainage', roadFrontage: 'photoRoadFrontage',
  soilCondition: 'photoSoilCondition', unauthorizedStructures: 'photoUnauthorizedStructures',
  floodEvidence: 'photoFloodEvidence', notableFeatures: 'photoNotableFeatures',
  surroundingArea: 'photoSurroundingArea', nearbyFacilities: 'photoNearbyFacilities',
}

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(String(reader.result ?? ''))
  reader.onerror = () => reject(reader.error)
  reader.readAsDataURL(blob)
})

// HTML image elements cannot attach the JWT header. Fetch through the app's
// authenticated fetch wrapper, then give the report an embeddable data URL.
export async function getReportPhotoSources(projectId: string, photos: UploadedPhoto[]) {
  const entries = await Promise.all(photos.map(async (photo) => {
    const key = reportPhotoKeys[photo.photoType]
    if (!key) return null
    try {
      const response = await fetch(photoUrl(projectId, photo.photoType, photo.createdAt))
      if (!response.ok) return null
      return [key, await blobToDataUrl(await response.blob())] as const
    } catch {
      return null
    }
  }))
  return Object.fromEntries(entries.filter((entry): entry is readonly [string, string] => entry !== null))
}
