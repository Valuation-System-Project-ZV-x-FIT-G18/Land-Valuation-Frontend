import type { ValuationFormData } from '@/Home_Pages/request-valuation/types/request-valuation'

// API calls used by the request-valuation page.

type SubmitResult = { ok: boolean; error?: string }

// Sends the valuation request to the backend (POST /api/valuation).
export async function submitValuationRequest(
  data: ValuationFormData,
): Promise<SubmitResult> {
  try {
    const res = await fetch('/api/valuation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) return { ok: true }

    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    const message = Array.isArray(body.message)
      ? body.message.join(' ')
      : (body.error as string)
    return { ok: false, error: message || 'Something went wrong. Please try again.' }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
