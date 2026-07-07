// API for registering a bank branch/officer.

export type NewBank = {
  bankName: string
  branchName: string
  branchCode: string
  officerName: string
  officerNic: string
  contact: string
  projectRef: string // applicant NIC or Project ID this request relates to
  email: string
  address: string
}

export async function registerBank(
  data: NewBank,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch('/api/coordinator/banks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && body.ok) return { ok: true }
    const message = Array.isArray(body.message)
      ? body.message.join(' ')
      : (body.message as string) || (body.error as string)
    return { ok: false, error: message || 'Could not register the bank.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
