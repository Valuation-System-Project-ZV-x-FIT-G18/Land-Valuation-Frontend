import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'

// API call for the first-login change-password screen.

type ChangeResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string }

export async function submitChangePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ChangeResult> {
  try {
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok) return { ok: true, user: body.user as AuthUser }
    const message = Array.isArray(body.message)
      ? body.message.join(' ')
      : (body.message as string)
    return { ok: false, error: message || 'Could not change the password.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
