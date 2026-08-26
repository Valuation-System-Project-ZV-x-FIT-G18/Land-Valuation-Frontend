export type BankBranch = {
  id: string
  branchName: string
  branchCode: string
  city: string
  // Shown to the coordinator on the valuation request form.
  contactPerson: string
  contactNumber: string
  contactEmail: string
}
export type BankOrganization = { id: string; name: string; createdAt: string; branches: BankBranch[] }

const message = async (response: Response, fallback: string) => {
  const body = await response.json().catch(() => ({}))
  const value = Array.isArray(body.message) ? body.message.join(' ') : body.message
  return String(value || fallback)
}

export const getBanks = async (): Promise<{ banks: BankOrganization[]; error?: string }> => {
  try {
    const response = await fetch('/api/admin/banks')
    if (!response.ok) return { banks: [], error: await message(response, 'Could not load banks.') }
    return await response.json()
  } catch { return { banks: [], error: 'Could not reach the server.' } }
}

export const addBank = async (name: string) => {
  const response = await fetch('/api/admin/banks', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
  })
  if (!response.ok) throw new Error(await message(response, 'Could not add the bank.'))
  return (await response.json()).bank as BankOrganization
}

export const addBranch = async (bankId: string, data: Omit<BankBranch, 'id'>) => {
  const response = await fetch(`/api/admin/banks/${bankId}/branches`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(await message(response, 'Could not add the branch.'))
  return (await response.json()).branch as BankBranch
}

export const deleteBranch = async (bankId: string, branchId: string) => {
  const response = await fetch(`/api/admin/banks/${bankId}/branches/${branchId}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await message(response, 'Could not remove the branch.'))
}

export const deleteBank = async (bankId: string) => {
  const response = await fetch(`/api/admin/banks/${bankId}`, { method: 'DELETE' })
  if (!response.ok) throw new Error(await message(response, 'Could not remove the bank.'))
}
