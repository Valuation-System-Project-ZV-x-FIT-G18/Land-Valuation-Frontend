// Contact-form submissions the coordinator can review.

export type ContactMessage = {
  id: number
  name: string
  email: string
  phone: string
  message: string
  status: 'Open' | 'Resolved'
  resolvedAt: string | null
  createdAt: string
}

export async function updateContactMessageStatus(id: number, status: 'Open' | 'Resolved') {
  try {
    const res = await fetch(`/api/contact/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) return { ok: true }
    // Surface what the server actually said - a bare "could not update" gives
    // no clue whether the problem is permissions, a missing row, or a bug.
    const body = (await res.json().catch(() => ({}))) as { message?: string }
    return { ok: false, error: body.message || 'Could not update the message.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

export async function getContactMessages(): Promise<{
  messages: ContactMessage[]
  error?: string
}> {
  try {
    const res = await fetch('/api/contact')
    if (!res.ok) return { messages: [], error: 'Could not load messages.' }
    return await res.json()
  } catch {
    return { messages: [], error: 'Could not reach the server.' }
  }
}
