// API for external client report access (loan applicant payments + bank viewing).

export type FeeBand = { from: number; to: number; rate: number; amount: number }

export type ClientReport = {
  projectId: string
  ownerName: string
  location: string
  locked: boolean
  paid: boolean
  slipPending: boolean
  fee: number
  marketValue: number
  feeBreakdown: FeeBand[]
  scaleFee: number
  minFee: number
  minApplied: boolean
}

export async function getApplicantReports(nic: string): Promise<ClientReport[]> {
  try {
    const res = await fetch(`/api/client/applicant/projects?nic=${encodeURIComponent(nic)}`)
    if (!res.ok) return []
    return (await res.json()).projects ?? []
  } catch {
    return []
  }
}

export async function payForReport(projectId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/client/applicant/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ projectId }),
    })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok ? { ok: true } : { ok: false, error: body.error || 'Payment failed.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

// Manual bank payment: upload the deposit slip to release the report.
export async function payWithSlip(
  projectId: string,
  slip: File,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const fd = new FormData()
    fd.append('projectId', projectId)
    fd.append('slip', slip)
    const res = await fetch('/api/client/applicant/pay-slip', { method: 'POST', body: fd })
    const body = await res.json().catch(() => ({}))
    return res.ok && body.ok ? { ok: true } : { ok: false, error: body.error || 'Upload failed.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

export async function getBankReports(bankId: string): Promise<ClientReport[]> {
  try {
    const res = await fetch(`/api/client/bank/projects?bankId=${encodeURIComponent(bankId)}`)
    if (!res.ok) return []
    return (await res.json()).projects ?? []
  } catch {
    return []
  }
}
