// Website submissions the coordinator can review:
//  - valuation requests (the public "Request a Land Valuation" form)
//  - contact messages (the homepage "Any inquiries" form)

export type ValuationRequest = {
  id: number
  name: string
  phone: string
  email: string
  nic: string
  message: string
  createdAt: string
}

export type ContactMessage = {
  id: number
  name: string
  email: string
  phone: string
  message: string
  createdAt: string
}

export async function getValuationRequests(): Promise<{
  requests: ValuationRequest[]
  error?: string
}> {
  try {
    const res = await fetch('/api/valuation')
    if (!res.ok) return { requests: [], error: 'Could not load requests.' }
    return await res.json()
  } catch {
    return { requests: [], error: 'Could not reach the server.' }
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
