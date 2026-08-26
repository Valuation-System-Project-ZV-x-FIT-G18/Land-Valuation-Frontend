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
  reason = '',
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/client/verify-slip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId, approve, reason }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok ? { ok: true } : { ok: false, error: body.error || 'Action failed.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

// Open the uploaded slip in a new tab.
//
// This cannot be a plain <a href="/api/..."> link. The bearer token is attached
// by the patched window.fetch, and a browser navigation does not go through it,
// so the endpoint answered 401 and the tab showed an error instead of the slip.
// Fetching it here and handing the tab a blob URL keeps the request authorised.
export async function openSlip(projectId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch(`/api/client/slip?projectId=${encodeURIComponent(projectId)}`)
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      return { ok: false, error: body.error || 'Could not open the slip.' }
    }
    const url = URL.createObjectURL(await res.blob())
    window.open(url, '_blank', 'noopener')
    // The tab keeps its own reference once opened; revoking immediately can
    // race it, so leave the URL to be reclaimed when this document unloads.
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}
