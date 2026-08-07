// API for the loan applicant's own Project Details draft (Fill Form page).
// The same draft is read by the coordinator's Create Project page to
// auto-fill from, once that applicant's NIC is confirmed there.

export type ProjectDetailsDraft = {
  data: Record<string, string>
  updatedAt: string
} | null

export async function getProjectDetailsDraft(nic: string): Promise<{ form: ProjectDetailsDraft }> {
  try {
    const res = await fetch(`/api/applicant/project-details?nic=${encodeURIComponent(nic)}`)
    if (!res.ok) return { form: null }
    return await res.json()
  } catch {
    return { form: null }
  }
}

export async function saveProjectDetailsDraft(
  nic: string,
  data: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/applicant/project-details', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nic, data }),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    const message = Array.isArray(body.message) ? body.message.join(' ') : (body.error as string)
    return { ok: false, error: message || 'Could not save the form.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}
