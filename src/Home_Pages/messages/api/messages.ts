//05
import type {
  DirectoryUser,
  Message,
  Thread,
} from '@/Home_Pages/messages/types/messages'

// API calls for messaging.

export async function searchUsers(
  search: string,
): Promise<{ users: DirectoryUser[]; error?: string }> {
  try {
    const res = await fetch(`/api/messages/users?search=${encodeURIComponent(search)}`)
    if (!res.ok) return { users: [], error: 'Could not load users.' }
    return await res.json()
  } catch {
    return { users: [], error: 'Could not reach the server.' }
  }
}

export async function getThreads(): Promise<{ threads: Thread[] }> {
  try {
    const res = await fetch('/api/messages/threads')
    if (!res.ok) return { threads: [] }
    return await res.json()
  } catch {
    return { threads: [] }
  }
}

export async function getConversation(
  otherId: string,
): Promise<{ messages: Message[] }> {
  try {
    const res = await fetch(`/api/messages/conversation?otherId=${encodeURIComponent(otherId)}`)
    if (!res.ok) return { messages: [] }
    return await res.json()
  } catch {
    return { messages: [] }
  }
}

export async function sendMessage(
  recipientId: string,
  body: string,
  file?: File | null,
): Promise<{ ok: boolean; error?: string }> {
  try {
    // multipart so an optional PDF/file can ride along with the text.
    const form = new FormData()
    form.append('recipientId', recipientId)
    form.append('body', body)
    if (file) form.append('file', file)

    const res = await fetch('/api/messages', { method: 'POST', body: form })
    const data = await res.json().catch(() => ({}) as Record<string, unknown>)
    if (res.ok && data.ok) return { ok: true }
    return { ok: false, error: (data.error as string) || 'Could not send the message.' }
  } catch {
    return { ok: false, error: 'Could not reach the server.' }
  }
}

// Fetch through the authenticated API client so the JWT reaches the backend.
export async function downloadAttachment(messageId: number): Promise<Blob | null> {
  try {
    const res = await fetch(`/api/messages/attachment?id=${messageId}`)
    return res.ok ? await res.blob() : null
  } catch {
    return null
  }
}
