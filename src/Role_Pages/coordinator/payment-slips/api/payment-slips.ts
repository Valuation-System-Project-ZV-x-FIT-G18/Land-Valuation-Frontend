// API for the coordinator's payment-slip verification.

export type PendingSlip = {
  projectId: string
  ownerName: string
  location: string
  slipPath: string
  uploaded: string
}

export async function getPendingSlips(): Promise<PendingSlip[]> {
  try {
    const res = await fetch('/api/client/pending-slips')
    if (!res.ok) return []
    return (await res.json()).slips ?? []
  } catch {
    return []
  }
}

export async function verifySlip(
  projectId: string,
  approve: boolean,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/client/verify-slip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, approve }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok ? { ok: true } : { ok: false, error: body.error || 'Action failed.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

// URL to view the uploaded slip.
export const slipUrl = (projectId: string) =>
  `/api/client/slip?projectId=${encodeURIComponent(projectId)}`
