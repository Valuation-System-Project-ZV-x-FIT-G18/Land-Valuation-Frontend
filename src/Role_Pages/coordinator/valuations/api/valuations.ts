import type { ValuationListRow } from '@/Role_Pages/coordinator/valuations/types/valuations'

// API calls for the coordinator's Valuations page.

// Every valuation in the system, newest first.
export async function listAllValuations(): Promise<{
  valuations: ValuationListRow[]
  error?: string
}> {
  try {
    const res = await fetch('/api/coordinator/valuations/list')
    if (!res.ok) return { valuations: [], error: 'Could not load valuations.' }
    return await res.json()
  } catch {
    return { valuations: [], error: 'Could not reach the server. Please try again.' }
  }
}
