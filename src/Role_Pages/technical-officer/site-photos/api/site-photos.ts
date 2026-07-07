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
