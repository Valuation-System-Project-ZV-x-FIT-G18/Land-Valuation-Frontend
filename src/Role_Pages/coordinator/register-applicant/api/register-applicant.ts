import type { RegisterApplicantPayload } from '@/Role_Pages/coordinator/register-applicant/types/register-applicant'
import { getApiError } from '@/Common_Pages/api/getApiError'

// What an edit sends: the same details minus the NIC (which can't change).
export type UpdateApplicantPayload = Omit<RegisterApplicantPayload, 'nic' | 'dateOfBirth'>

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

// Updates an existing applicant's details (PATCH /api/coordinator/applicants/:nic).
// The NIC identifies the applicant and is never changed.
export async function updateApplicant(
  nic: string,
  payload: UpdateApplicantPayload,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/coordinator/applicants/${encodeURIComponent(nic)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok) return { ok: true }
    return { ok: false, error: getApiError(body, 'Could not update the applicant. Please check the entered details.') }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
