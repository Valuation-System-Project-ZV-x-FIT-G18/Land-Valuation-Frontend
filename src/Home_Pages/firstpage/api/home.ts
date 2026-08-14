import type { ContactFormData } from '@/Home_Pages/firstpage/types/home'

// API calls used by the homepage.

type SubmitResult = { ok: boolean; error?: string }

// Sends the contact form to the backend (POST /api/contact, proxied to NestJS).
export async function submitContactMessage(
  data: ContactFormData,
): Promise<SubmitResult> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (res.ok) return { ok: true }

    // NestJS returns validation errors as { message: string[] }.
    const body = await res.json().catch(() => ({}) as Record<string, unknown>)
    return { ok: false, error: getApiError(body, 'Could not send the message. Please check the entered details.') }
  } catch {
    return { ok: false, error: 'Could not reach the server. Please try again.' }
  }
}
import { getApiError } from '@/Common_Pages/api/getApiError'
