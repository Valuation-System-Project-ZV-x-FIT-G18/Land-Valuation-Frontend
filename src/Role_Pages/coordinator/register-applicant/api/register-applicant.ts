import type { RegisterApplicantPayload } from '@/Role_Pages/coordinator/register-applicant/types/register-applicant'
import { getApiError } from '@/Common_Pages/api/getApiError'

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
    return { ok: false, error: getApiError(body, 'Could not register the applicant. Please check the entered details.') }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
