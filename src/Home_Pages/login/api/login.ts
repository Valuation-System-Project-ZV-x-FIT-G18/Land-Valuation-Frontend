import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'

export type LoginResult =
  | { ok: true; user: AuthUser; accessToken: string }
  | { ok: false; error: string }

export async function submitLogin(email: string, password: string): Promise<LoginResult> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok) return { ok: true, user: body.user as AuthUser, accessToken: body.accessToken as string }
    return { ok: false, error: (body.message as string) || 'Invalid email or password.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}

