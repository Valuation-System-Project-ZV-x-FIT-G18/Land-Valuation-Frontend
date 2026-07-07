import type { LoggedInUser } from '@/Home_Pages/internal-login/types/internal-login'

// API calls used by the internal login page.

type LoginResult =
  | { ok: true; user: LoggedInUser }
  | { ok: false; error: string }

// Logs an internal staff member in (POST /api/auth/login).
export async function submitInternalLogin(
  userId: string,
  password: string,
): Promise<LoginResult> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok) return { ok: true, user: body.user as LoggedInUser }
    return { ok: false, error: (body.message as string) || 'Invalid ID or password.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
