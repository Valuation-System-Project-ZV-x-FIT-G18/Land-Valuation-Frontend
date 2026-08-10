export type ChatTurn = { role: 'user' | 'assistant'; content: string }

export async function askChatbot(userId: string, role: string, message: string, history: ChatTurn[]) {
  const response = await fetch('/api/chatbot/message', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, role, message, history: history.slice(-6) }),
  })
  const data = await response.json().catch(() => ({})) as { answer?: string; sources?: string[]; message?: string }
  if (response.status === 404) {
    throw new Error('Chat service is not available. Please restart the backend server.')
  }
  if (!response.ok) throw new Error(data.message || 'The assistant could not answer right now.')
  return { answer: data.answer ?? 'No answer was returned.', sources: data.sources ?? [] }
}
