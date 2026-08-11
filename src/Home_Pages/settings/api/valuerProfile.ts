import type { ValuerProfile } from '@/Home_Pages/settings/types/valuerProfile'

const message = (body: Record<string, unknown>, fallback: string) => {
  const value = body.message
  return Array.isArray(value) ? value.join(' ') : typeof value === 'string' ? value : fallback
}

export async function getValuerProfile(userId: string) {
  try {
    const res = await fetch(`/api/manager/valuer-profile?userId=${encodeURIComponent(userId)}`)
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    return res.ok
      ? { profile: body.profile as ValuerProfile | null }
      : { profile: null, error: message(body, 'Could not load the valuer profile.') }
  } catch {
    return { profile: null, error: 'Could not reach the server.' }
  }
}

export async function saveValuerProfile(profile: ValuerProfile) {
  try {
    const res = await fetch('/api/manager/valuer-profile', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile),
    })
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    return res.ok && body.ok
      ? { ok: true, profile: body.profile as ValuerProfile }
      : { ok: false, error: message(body, 'Could not save the valuer profile.') }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}
