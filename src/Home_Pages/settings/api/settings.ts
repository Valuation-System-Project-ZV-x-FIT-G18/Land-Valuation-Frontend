import type { Profile } from '@/Home_Pages/settings/types/settings'

// API calls for the Settings page.

// Load the logged-in user's profile.
export async function getProfile(
  userId: string,
): Promise<{ profile?: Profile; error?: string }> {
  try {
    const res = await fetch(`/api/auth/profile?userId=${encodeURIComponent(userId)}`)
    if (!res.ok) return { error: 'Could not load your profile.' }
    const body = await res.json()
    return { profile: body.profile as Profile | undefined }
  } catch {
    return { error: 'Could not reach the server. Please try again.' }
  }
}

// Save profile changes to the users table.
export async function updateProfile(
  profile: Profile,
): Promise<{ ok: boolean; profile?: Profile; error?: string }> {
  try {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
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
