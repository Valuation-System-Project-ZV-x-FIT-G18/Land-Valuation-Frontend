import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import ConfirmModal from '@/Common_Pages/components/ui/ConfirmModal'
import { allDistricts } from '@/Common_Pages/constants/sriLanka'
import { validateLocalPhone } from '@/Common_Pages/validation/validateLocalPhone'
import { validateEmail } from '@/Common_Pages/validation/validateEmail'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { addBank, addBranch, deleteBank, deleteBranch, getBanks, type BankOrganization } from '../api/banks'

const SRI_LANKAN_BANKS = [
  'Amana Bank',
  'Bank of Ceylon',
  'Cargills Bank',
  'Commercial Bank of Ceylon',
  'DFCC Bank',
  'Hatton National Bank',
  'Indian Bank',
  'Indian Overseas Bank',
  'MCB Bank',
  'National Development Bank',
  'Nations Trust Bank',
  'Pan Asia Banking Corporation',
  "People's Bank",
  'Public Bank Berhad',
  'Sampath Bank',
  'Seylan Bank',
  'Standard Chartered Bank',
  'State Bank of India',
  'Union Bank of Colombo',
].sort()

const BankManagementPage = () => {
  const [banks, setBanks] = useState<BankOrganization[]>([])
  const [bankName, setBankName] = useState('')
  const [showBankForm, setShowBankForm] = useState(false)
  const [lastAddedBank, setLastAddedBank] = useState('')
  const [drafts, setDrafts] = useState<Record<string, { branchName: string; branchCode: string; city: string; contactPerson: string; contactNumber: string; contactEmail: string }>>({})
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const load = () =>
    getBanks().then((result) => {
      setBanks(result.banks)
      setShowBankForm(result.banks.length === 0)
      setError(result.error ?? '')
    })

  useEffect(() => { load() }, [])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const draft = (id: string) => drafts[id] ?? { branchName: '', branchCode: '', city: '', contactPerson: '', contactNumber: '', contactEmail: '' }
  const change = (id: string, key: string, value: string) => setDrafts((all) => ({ ...all, [id]: { ...draft(id), [key]: value } }))
  // What the admin has asked to remove, pending confirmation.
  const [pendingRemoval, setPendingRemoval] = useState<{ kind: 'bank' | 'branch'; bankId: string; id: string; label: string } | null>(null)

  const confirmRemoval = async () => {
    if (!pendingRemoval) return
    const target = pendingRemoval
    setPendingRemoval(null)
    setError('')
    try {
      if (target.kind === 'bank') await deleteBank(target.bankId)
      else await deleteBranch(target.bankId, target.id)
      await load()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  const [draftErrors, setDraftErrors] = useState<Record<string, { contactNumber?: string; contactEmail?: string }>>({})
  const errorsFor = (id: string) => draftErrors[id] ?? {}

  // The contact email is the Bank user's login address and receives the
  // temporary password, so a branch cannot be registered without it.
  const validateContact = (bankId: string) => {
    const d = draft(bankId)
    const next = {
      contactNumber: d.contactNumber.trim() ? validateLocalPhone(d.contactNumber) : undefined,
      contactEmail: d.contactEmail.trim() ? validateEmail(d.contactEmail) : 'Contact email is required for the Bank login.',
    }
    setDraftErrors((all) => ({ ...all, [bankId]: next }))
    return !next.contactNumber && !next.contactEmail
  }

  const branchSuggestions = (bank: { branches: { branchName: string }[] }) => {
    const taken = new Set(bank.branches.map((b) => b.branchName.trim().toLowerCase()))
    return allDistricts.filter((town) => !taken.has(town.toLowerCase()))
  }

  const cityOptions = [
    { value: '', label: 'Select district' },
    ...allDistricts.map((name) => ({ value: name, label: name })),
  ]

  const bankOptions = [
    { value: '', label: 'Select a bank' },
    ...SRI_LANKAN_BANKS
      .filter((name) => !banks.some((bank) => bank.name.toLowerCase() === name.toLowerCase()))
      .map((name) => ({ value: name, label: name })),
  ]

  const createBank = async () => {
    setError(''); setBusy('bank')
    try {
      const bank = await addBank(bankName)
      setBanks((all) => [...all, bank].sort((a, b) => a.name.localeCompare(b.name)))
      setLastAddedBank(bank.name)
      setBankName('')
      setShowBankForm(false)
      setTimeout(() => document.getElementById(`bank-${bank.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
    }
    catch (e) { setError((e as Error).message) } finally { setBusy('') }
  }
  const createBranch = async (bankId: string) => {
    setError(''); setBusy(bankId)
    try {
      const branch = await addBranch(bankId, draft(bankId))
      setBanks((all) => all.map((bank) => bank.id === bankId ? { ...bank, branches: [...bank.branches, branch] } : bank))
      setDrafts((all) => ({ ...all, [bankId]: { branchName: '', branchCode: '', city: '', contactPerson: '', contactNumber: '', contactEmail: '' } }))
    } catch (e) { setError((e as Error).message) } finally { setBusy('') }
  }

  return <div className="mx-auto max-w-6xl space-y-6">
    <ConfirmModal
      open={pendingRemoval !== null}
      title={pendingRemoval?.kind === 'bank' ? 'Remove this bank?' : 'Remove this branch?'}
      message={
        pendingRemoval
          ? pendingRemoval.kind === 'bank'
            ? `${pendingRemoval.label} and all of its registered branches will be removed. This cannot be undone.`
            : `${pendingRemoval.label} will be removed from this bank. This cannot be undone.`
          : ''
      }
      confirmLabel="Remove"
      destructive
      onConfirm={confirmRemoval}
      onCancel={() => setPendingRemoval(null)}
    />
    <div><h1 className="text-3xl font-bold text-white">Bank <GradientText>Management</GradientText></h1><p className="mt-2 text-emerald-100">Register bank organizations and their official branches for valuation requests.</p></div>
    {error && <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
    <Card className="p-6">{showBankForm ? <><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-semibold text-white">Add bank organization</h2><p className="mt-1 text-sm text-emerald-100">Choose an organization once. Its official branches can then be registered below.</p></div>{banks.length > 0 && <Button variant="ghost" size="sm" onClick={() => { setError(''); setShowBankForm(false); setBankName('') }}>Cancel</Button>}</div><div className="mt-4 grid items-end gap-3 sm:grid-cols-[1fr_auto]"><SelectField label="Bank name *" name="bankName" value={bankName} options={bankOptions} onChange={(e) => { setError(''); setBankName(e.target.value) }} /><Button loading={busy === 'bank'} disabled={!bankName} onClick={createBank}>Add Bank</Button></div></> : <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-lg font-semibold text-white">{lastAddedBank ? `${lastAddedBank} registered` : 'Bank organizations'}</h2><p className="mt-1 text-sm text-emerald-100">{banks.length} {banks.length === 1 ? 'bank is' : 'banks are'} available for valuation requests.</p></div><Button variant="outline" size="sm" onClick={() => { setError(''); setLastAddedBank(''); setShowBankForm(true) }}>Add another bank</Button></div>}</Card>
    <div className="space-y-4">{banks.map((bank) => <div id={`bank-${bank.id}`} key={bank.id} className="scroll-mt-24"><Card className="p-6">
      <div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold text-white">{bank.name}</h2><p className="text-sm text-emerald-100">{bank.branches.length} registered {bank.branches.length === 1 ? 'branch' : 'branches'}</p></div><Button variant="ghost" size="sm" onClick={() => setPendingRemoval({ kind: 'bank', bankId: bank.id, id: bank.id, label: bank.name })}>Remove bank</Button></div>
      {bank.branches.length > 0 && <div className="mt-5 overflow-hidden rounded-xl border border-white/10">{bank.branches.map((branch) => <div key={branch.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-3 last:border-0"><div className="min-w-0 flex-1 space-y-1"><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span className="font-semibold text-white">{branch.branchName}</span><span className="text-accent-200">Code: {branch.branchCode}</span><span className="text-emerald-200">{branch.city || 'City not provided'}</span></div><div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm text-emerald-200"><span>{branch.contactPerson || 'No contact person'}</span><span>{branch.contactNumber ? `+94 ${branch.contactNumber}` : 'No contact number'}</span><span className="break-all">{branch.contactEmail || 'No contact email'}</span></div></div><button type="button" onClick={() => setPendingRemoval({ kind: 'branch', bankId: bank.id, id: branch.id, label: `${branch.branchName} (${branch.branchCode})` })} className="shrink-0 rounded-lg border border-red-400 px-3 py-1 text-xs font-semibold text-red-100 transition hover:bg-red-50">Remove</button></div>)}</div>}
      <div className="mt-6 border-t border-white/10 pt-5"><h3 className="font-semibold text-emerald-50">Add official branch &amp; Bank login</h3><p className="mt-1 text-sm text-emerald-100">The contact email will receive a temporary password and can sign in immediately after registration.</p><div className="mt-3 grid gap-4 sm:grid-cols-3"><FormField label="Branch name *" name={`name-${bank.id}`} value={draft(bank.id).branchName} suggestions={branchSuggestions(bank)} placeholder="Start typing or pick a town" onChange={(e) => change(bank.id, 'branchName', e.target.value)} /><FormField label="Official branch code *" name={`code-${bank.id}`} value={draft(bank.id).branchCode} inputMode="numeric" helperText="This becomes the Bank account's internal login ID." onChange={(e) => change(bank.id, 'branchCode', e.target.value.replace(/\D/g, ''))} /><SelectField label="City" name={`city-${bank.id}`} value={draft(bank.id).city} options={cityOptions} onChange={(e) => change(bank.id, 'city', e.target.value)} /><FormField label="Contact person" name={`contact-${bank.id}`} value={draft(bank.id).contactPerson} helperText="Shown to coordinators on the valuation request." onChange={(e) => change(bank.id, 'contactPerson', e.target.value)} /><FormField label="Contact number" name={`phone-${bank.id}`} type="tel" inputMode="numeric" prefix="+94" maxLength={9} placeholder="e.g. 771234567" autoComplete="off" preventAutofill value={draft(bank.id).contactNumber} error={errorsFor(bank.id).contactNumber} onBlur={() => validateContact(bank.id)} onChange={(e) => change(bank.id, 'contactNumber', e.target.value.replace(/\D/g, ''))} /><FormField label="Login email *" name={`email-${bank.id}`} type="email" autoComplete="off" placeholder="e.g. branch@bank.lk" value={draft(bank.id).contactEmail} error={errorsFor(bank.id).contactEmail} onBlur={() => validateContact(bank.id)} onChange={(e) => change(bank.id, 'contactEmail', e.target.value)} /></div><div className="mt-4 flex justify-end"><Button size="sm" loading={busy === bank.id} disabled={!draft(bank.id).branchName || !draft(bank.id).branchCode || !draft(bank.id).contactEmail.trim()} onClick={() => { if (validateContact(bank.id)) createBranch(bank.id) }}>Create Branch &amp; Login</Button></div></div>
    </Card></div>)}{banks.length === 0 && <Card className="p-8 text-center text-emerald-100">No banks registered yet. Add the first organization above.</Card>}</div>
  </div>
}

export default BankManagementPage
