// Contact-form submissions the coordinator can review.

export type ContactMessage = {
  id: number
  name: string
  email: string
  phone: string
  message: string
  createdAt: string
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
