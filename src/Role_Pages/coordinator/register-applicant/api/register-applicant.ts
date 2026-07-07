import type { RegisterApplicantPayload } from '@/Role_Pages/coordinator/register-applicant/types/register-applicant'

// Registers a new loan applicant (POST /api/coordinator/applicants/register).
export async function registerApplicant(
  payload: RegisterApplicantPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/coordinator/applicants/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok) return { ok: true }
    const message = Array.isArray(body.message)
      ? body.message.join(' ')
      : (body.error as string)
    return { ok: false, error: message || 'Could not register the applicant.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
