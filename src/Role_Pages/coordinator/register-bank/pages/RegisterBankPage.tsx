import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Input from '@/Common_Pages/components/ui/Input'
import Modal from '@/Common_Pages/components/ui/Modal'
import FormField from '@/Common_Pages/components/ui/FormField'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import PageHeader from '@/Common_Pages/components/ui/PageHeader'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { registerBank, type NewBank } from '@/Role_Pages/coordinator/register-bank/api/register-bank'
import { validateBank, type BankErrors } from '@/Role_Pages/coordinator/register-bank/pages/validateBank'

// Common Sri Lankan banks to choose from.
const banks = [
  'Bank of Ceylon', "People's Bank", 'Commercial Bank of Ceylon', 'Hatton National Bank',
  'Sampath Bank', 'National Development Bank (NDB)', 'DFCC Bank', 'Seylan Bank',
  'National Savings Bank (NSB)', 'Pan Asia Bank', 'Union Bank', 'Nations Trust Bank',
  'Cargills Bank', 'Amana Bank',
]

const fields: { name: keyof NewBank; label: string }[] = [
  { name: 'projectRef', label: 'Applicant NIC or Project ID *' },
  { name: 'branchName', label: 'Branch Name' },
  { name: 'branchCode', label: 'Branch Code *' },
  { name: 'officerName', label: "Officer's Name *" },
  { name: 'officerNic', label: "Officer's NIC *" },
  { name: 'contact', label: 'Contact Number *' },
  { name: 'email', label: 'Email' },
  { name: 'address', label: 'Branch Address' },
]

const empty: NewBank = {
  bankName: '', branchName: '', branchCode: '', officerName: '',
  officerNic: '', contact: '', projectRef: '', email: '', address: '',
}

// Coordinator > Register Bank.
const RegisterBankPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const incomingNic = (location.state as { nic?: string } | null)?.nic ?? ''

  const [form, setForm] = useState<NewBank>(() => ({ ...empty, projectRef: incomingNic }))
  const [errors, setErrors] = useState<BankErrors>({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [createdRef, setCreatedRef] = useState('')

  const [searchRef, setSearchRef] = useState('')
  const [foundBanks, setFoundBanks] = useState<
    { branchCode: string; bankName: string; branchName: string; officerName: string; projectRef: string }[] | null
  >(null)
  const [bankSearching, setBankSearching] = useState(false)

  const searchBanks = async () => {
    const ref = searchRef.trim()
    if (!ref) return
    setBankSearching(true)
    try {
      const r = await fetch(`/api/coordinator/banks/search?ref=${encodeURIComponent(ref)}`)
      const body = await r.json()
      setFoundBanks(body.banks ?? [])
    } catch { setFoundBanks([]) }
    setBankSearching(false)
  }

  const set = (name: keyof NewBank, value: string) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setServerError('')
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof NewBank
    const found = validateBank({ ...form, [name]: e.target.value })
    setErrors((prev) => ({ ...prev, [name]: found[name] }))
  }

  const isValid = Object.keys(validateBank(form)).length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validateBank(form)
    if (Object.keys(found).length > 0) { setErrors(found); return }
    setErrors({})
    setSubmitting(true)
    const res = await registerBank(form)
    setSubmitting(false)
    if (res.ok) { setCreatedRef(form.projectRef); setDone(true); setForm(empty) }
    else setServerError(res.error ?? 'Could not register the bank.')
  }

  const bankOptions = [{ value: '', label: 'Select a bank' }, ...banks.map((b) => ({ value: b, label: b }))]

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Register" accent="Bank" subtitle="Add a bank branch and its officer who request valuations." />

      {/* Search existing banks */}
      <Card className="p-5 sm:p-6">
        <p className="mb-2 text-sm font-semibold text-gold-300">Find a registered bank</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input aria-label="Search reference" value={searchRef} onChange={(e) => setSearchRef(e.target.value)} placeholder="Applicant NIC or Project ID" />
          </div>
          <Button type="button" onClick={searchBanks} loading={bankSearching} className="shrink-0">
            {bankSearching ? 'Searching…' : 'Search'}
          </Button>
        </div>
        {foundBanks !== null && (
          foundBanks.length === 0 ? (
            <p className="mt-3 text-sm text-emerald-100/60">No bank registered for that reference.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {foundBanks.map((b) => (
                <div key={b.branchCode} className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
                  <p className="font-medium text-white">{b.bankName} — {b.branchName || b.branchCode}</p>
                  <p className="text-xs text-emerald-100/70">Branch code {b.branchCode} · Officer {b.officerName} · Ref {b.projectRef}</p>
                </div>
              ))}
            </div>
          )
        )}
      </Card>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <SelectField label="Bank *" name="bankName" value={form.bankName} onChange={(e) => set('bankName', e.target.value)} options={bankOptions} error={errors.bankName} />
          <div className="grid gap-5 lg:grid-cols-2">
            {fields.map((f) => (
              <FormField key={f.name} label={f.label} name={f.name} value={form[f.name]} onChange={(e) => set(f.name, e.target.value)} onBlur={handleBlur} error={errors[f.name]} />
            ))}
          </div>
          {serverError && <p className="text-sm text-red-300">{serverError}</p>}
          <Button type="submit" fullWidth loading={submitting} disabled={!isValid}>
            {submitting ? 'Registering…' : 'Register Bank'}
          </Button>
        </form>
      </Card>

      <Modal open={done} onClose={() => setDone(false)}>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">✓</div>
          <h3 className="mt-4 text-2xl"><GradientText>Bank Registered</GradientText></h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100/70">The bank branch has been added successfully.</p>
          <p className="mt-6 font-medium text-white">Create the project now?</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <Button type="button" fullWidth onClick={() => navigate('/coordinator/new-project', { state: { nic: createdRef } })}>Yes, create project</Button>
            <Button type="button" variant="outline" fullWidth onClick={() => setDone(false)}>Register another</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default RegisterBankPage
