import type { Profile } from '@/Home_Pages/settings/types/settings'

// API calls for the Settings page.

// Load the logged-in user's profile.
export async function getProfile(): Promise<{ profile?: Profile; error?: string }> {
  try {
    const res = await fetch('/api/auth/profile')
    if (!res.ok) return { error: 'Could not load your profile.' }
    const body = await res.json()
    return { profile: body.profile as Profile | undefined }
  } catch {
    return { error: 'Could not reach the server. Please try again.' }
  }
}

// Save profile changes to the users table. The backend's UpdateProfileDto
// rejects any field it doesn't explicitly whitelist (role/nic/photoPath are
// read-only there), so only send the fields it actually accepts.
export async function updateProfile(
  profile: Profile,
): Promise<{ ok: boolean; profile?: Profile; error?: string }> {
  const {
    firstName, lastName, initials, email, phone,
    dateOfBirth, province, district, city, postalCode, address,
  } = profile
  const payload = {
    firstName, lastName, initials, email, phone,
    dateOfBirth, province, district, city, postalCode, address,
  }
  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true, profile: body.profile as Profile }
    const message = Array.isArray(body.message)
      ? body.message.join(' ')
      : (body.message as string)
    return { ok: false, error: message || 'Could not save your changes.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

// Upload/replace the logged-in user's profile picture.
export async function uploadAvatar(
  file: File,
): Promise<{ ok: boolean; photoPath?: string; error?: string }> {
  try {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/auth/avatar', { method: 'POST', body: form })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true, photoPath: body.photoPath as string }
    return { ok: false, error: (body.error as string) || 'Could not upload your picture.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
