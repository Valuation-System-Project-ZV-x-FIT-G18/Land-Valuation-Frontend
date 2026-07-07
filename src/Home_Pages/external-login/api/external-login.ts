import type { AuthUser } from '@/Common_Pages/components/auth/useAuth'

// API calls for the external (loan applicant) login.

type LoginResult =
  | { ok: true; user: AuthUser }
  | { ok: false; error: string }

// Logs a loan applicant in with their NIC (username) + password.
// Loan applicants live in the `users` table with user_id = NIC.
export async function submitExternalLogin(
  nic: string,
  password: string,
): Promise<LoginResult> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: nic.trim(), password }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok) return { ok: true, user: body.user as AuthUser }
    return { ok: false, error: (body.message as string) || 'Invalid NIC or password.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
