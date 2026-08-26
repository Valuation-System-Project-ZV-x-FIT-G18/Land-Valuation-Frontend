import { useEffect, useMemo, useState } from 'react'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import {
  fetchRegisteredBanks,
  type RegisteredBank,
} from '@/Role_Pages/coordinator/new-valuation/api/new-valuation'

// What we report up to the form whenever the bank/branch selection changes.
export type BankSelection = {
  bankName: string
  branchName: string
  branchCode: string
  contactPerson: string
  contactNo: string
}

type Props = {
  bankName: string
  branchCode: string
  onSelect: (sel: BankSelection) => void
  bankError?: string
  branchError?: string
}

// Bank + Branch pickers for the New Valuation form. Banks are the ones the admin
// registered (role "Bank" on the users table). Choosing a bank filters the branch
// list; choosing a branch auto-fills the contact person and number.
//
// Branches are identified internally by Branch Code because the
// Branch Name can be blank — using the code as the value keeps selection reliable.
const BankBranchSelect = ({ bankName, branchCode, onSelect, bankError, branchError }: Props) => {
  const [banks, setBanks] = useState<RegisteredBank[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRegisteredBanks()
      .then(setBanks)
      .finally(() => setLoading(false))
  }, [])

  // Distinct bank names for the first dropdown.
  const bankNames = useMemo(
    () => Array.from(new Set(banks.map((b) => b.bankName))).sort(),
    [banks],
  )

  // Branches belonging to the currently selected bank.
  const branches = useMemo(
    () => banks.filter((b) => b.bankName === bankName),
    [banks, bankName],
  )

  // The full record for the selected branch (holds the contact details).
  const selected = branches.find((b) => b.branchCode === branchCode)

  const bankOptions = [
    { value: '', label: loading ? 'Loading banks…' : 'Select a bank' },
    ...bankNames.map((n) => ({ value: n, label: n })),
  ]

  const branchOptions = [
    { value: '', label: bankName ? 'Select a branch' : 'Choose a bank first' },
    ...branches.map((b) => ({
      value: b.branchCode,
      label: b.branchName ? `${b.branchName} (${b.branchCode})` : b.branchCode,
    })),
  ]

  const handleBank = (name: string) => {
    // Changing the bank clears the branch and any auto-filled contact.
    onSelect({ bankName: name, branchName: '', branchCode: '', contactPerson: '', contactNo: '' })
  }

  const handleBranch = (code: string) => {
    const match = banks.find((b) => b.bankName === bankName && b.branchCode === code)
    onSelect({
      bankName,
      branchName: match?.branchName ?? '',
      branchCode: code,
      contactPerson: match?.personName ?? '',
      contactNo: match?.contact ?? '',
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <SelectField
          label="Bank *"
          name="bankName"
          value={bankName}
          onChange={(e) => handleBank(e.target.value)}
          options={bankOptions}
          error={bankError}
        />
        <SelectField
          label="Branch *"
          name="branchCode"
          value={branchCode}
          onChange={(e) => handleBranch(e.target.value)}
          options={branchOptions}
          error={branchError}
        />
      </div>

      {!loading && bankNames.length === 0 && (
        <p className="text-xs text-accent-200">
          No bank branches are available. Ask an administrator to register the bank and its official branch first.
        </p>
      )}

      {/* Auto-filled from the selected branch — read only. */}
      <div className="grid gap-5 sm:grid-cols-2">
        <ReadOnly label="Contact Person" value={selected?.personName ?? ''} />
        <ReadOnly label="Contact Number" value={selected?.contact ?? ''} />
      </div>
    </div>
  )
}

// Small read-only display matching the FormField look.
const ReadOnly = ({ label, value }: { label: string; value: string }) => (
  <div>
    <label className="mb-1.5 block text-sm font-medium text-emerald-100">{label}</label>
    <div className="w-full rounded-xl border border-white/10 bg-surface px-4 py-3 text-white">
      {value || <span className="text-emerald-200">Auto-filled from the branch</span>}
    </div>
  </div>
)

export default BankBranchSelect
