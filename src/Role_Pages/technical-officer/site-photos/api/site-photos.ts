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
  onProgress?: (percent: number) => void,
): Promise<{ ok: boolean; error?: string; description?: string }> {
  return new Promise((resolve) => {
    const form = new FormData()
    form.append('projectId', projectId)
    form.append('toId', toId)
    form.append('photoType', photoType)
    form.append('describe', describe ? 'true' : 'false')
    form.append('photoLabel', photoLabel)
    form.append('file', file)
    const request = new XMLHttpRequest()
    request.open('POST', '/api/technical-officer/site-photos')
    request.withCredentials = true
    try {
      const token = JSON.parse(localStorage.getItem('accessToken') ?? '""') as string
      if (token) request.setRequestHeader('Authorization', `Bearer ${token}`)
    } catch {
      // The server will return 401 and the UI will keep the photo available for retry.
    }
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress?.(Math.round((event.loaded / event.total) * 100))
    }
    request.onerror = () => resolve({ ok: false, error: 'Could not reach the server.' })
    request.onload = () => {
      let data: Record<string, unknown> = {}
      try { data = JSON.parse(request.responseText) as Record<string, unknown> } catch { /* use the fallback below */ }
      if (request.status >= 200 && request.status < 300 && data.ok) {
        resolve({ ok: true, description: (data.description as string) ?? '' })
      } else {
        resolve({ ok: false, error: String(data.error || data.message || 'Could not upload the photo.') })
      }
    }
    request.send(form)
  })
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
