import type {
  Applicant,
  ApplicantSearchResult,
  RegisterApplicantData,
} from '@/Role_Pages/coordinator/create-project/types/create-project'

// API calls for the Create Project flow.

// Searches for a loan applicant by NIC (GET /api/coordinator/applicants/search).
export async function searchApplicantByNic(
  nic: string,
): Promise<ApplicantSearchResult> {
  try {
    const res = await fetch(
      `/api/coordinator/applicants/search?nic=${encodeURIComponent(nic.trim())}`,
    )
    if (!res.ok) return { found: false, error: 'Search failed. Please try again.' }
    return (await res.json()) as ApplicantSearchResult
  } catch {
    return { found: false, error: 'Could not reach the server. Please try again.' }
  }
}

// Registers a new loan applicant (POST /api/coordinator/applicants/register).
export async function registerApplicant(
  data: RegisterApplicantData,
): Promise<{ ok: boolean; applicant?: Applicant; error?: string }> {
  try {
    const res = await fetch('/api/coordinator/applicants/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok) return { ok: true, applicant: body.applicant as Applicant }
    const message = Array.isArray(body.message)
      ? body.message.join(' ')
      : (body.error as string)
    return { ok: false, error: message || 'Could not register the applicant.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
