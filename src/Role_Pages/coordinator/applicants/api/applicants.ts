import type { ApplicantListRow } from '@/Role_Pages/coordinator/applicants/types/applicants'

// API calls for the coordinator's Applicants page.

// The full registered-applicant roster.
export async function listApplicants(): Promise<{
  applicants: ApplicantListRow[]
  error?: string
}> {
  try {
    const res = await fetch('/api/coordinator/applicants/list')
    if (!res.ok) return { applicants: [], error: 'Could not load applicants.' }
    return await res.json()
  } catch {
    return { applicants: [], error: 'Could not reach the server. Please try again.' }
  }
}
