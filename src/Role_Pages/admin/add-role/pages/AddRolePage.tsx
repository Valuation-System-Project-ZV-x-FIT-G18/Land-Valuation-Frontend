import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Modal from '@/Common_Pages/components/ui/Modal'
import FormField from '@/Common_Pages/components/ui/FormField'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import ProvinceDistrictFields from '@/Common_Pages/components/ui/ProvinceDistrictFields'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { useAutoField } from '@/Common_Pages/hooks/useAutoField'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'
import { deriveInitials } from '@/Common_Pages/lib/deriveInitials'
import { addRole, type NewRole } from '@/Role_Pages/admin/add-role/api/add-role'
import { validateAddRole, type RoleErrors } from '@/Role_Pages/admin/add-role/pages/validateAddRole'

const today = new Date().toISOString().slice(0, 10)

const roleOptions = [
  { value: '', label: 'Select a role' },
  { value: 'Coordinator', label: 'Coordinator' },
  { value: 'Technical Officer', label: 'Technical Officer' },
  { value: 'Manager L1', label: 'Manager L1' },
  { value: 'Manager L2', label: 'Manager L2' },
  { value: 'Manager L3', label: 'Manager L3' },
  { value: 'Bank', label: 'Bank' },
  { value: 'Admin', label: 'Admin' },
]

const BANK_NAMES = [
  'Bank of Ceylon', "People's Bank", 'Commercial Bank of Ceylon', 'Hatton National Bank',
  'Sampath Bank', 'Seylan Bank', 'National Development Bank (NDB)', 'DFCC Bank',
  'Nations Trust Bank', 'Pan Asia Banking Corporation', 'Union Bank of Colombo',
  'Amana Bank', 'Cargills Bank', 'HDFC Bank of Sri Lanka', 'National Savings Bank (NSB)',
  'Regional Development Bank (RDB)', 'Standard Chartered Bank', 'HSBC Sri Lanka',
]

const bankOptions = [
  { value: '', label: 'Select a bank' },
  ...BANK_NAMES.map((b) => ({ value: b, label: b })),
]

type PersistedRole = Omit<NewRole, 'password'>

// Field groups, rendered in this exact order:
// First Name, Last Name, [Name with Initials], NIC, Email, Phone,
// [Province, District], City, Postal Code, Address, Date of Birth, Password.
const nameFields: { name: keyof PersistedRole; label: string; type?: string }[] = [
  { name: 'firstName', label: 'First Name *' },
  { name: 'lastName', label: 'Last Name *' },
]
const contactFields: { name: keyof PersistedRole; label: string; type?: string }[] = [
  { name: 'nic', label: 'NIC *' },
  { name: 'email', label: 'Email *', type: 'email' },
  { name: 'phone', label: 'Phone' },
]
const addressFields: { name: keyof PersistedRole; label: string; type?: string }[] = [
  { name: 'city', label: 'City' },
  { name: 'postalCode', label: 'Postal Code' },
  { name: 'address', label: 'Address' },
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
]

const empty: PersistedRole = {
  role: '', firstName: '', lastName: '', initials: '', nic: '', email: '', phone: '',
  district: '', province: '', city: '', postalCode: '', address: '', dateOfBirth: '',
  branchCode: '', branchName: '', bankName: '', designation: '',
}

// Admin > Add Role. Create a staff account; the person is emailed their login.
const AddRolePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  // Everything except the password survives a refresh; the password is never stored.
  const [form, setForm] = useSessionState<PersistedRole>('addRole', empty)
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<RoleErrors>({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createdId, setCreatedId] = useState('')

  const full: NewRole = { ...form, password }

  if (user && user.role !== 'Admin') {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <p className="font-semibold text-gold-200">Admins only</p>
        <p className="mt-1 text-sm text-emerald-100/70">You don&apos;t have permission to add roles.</p>
      </Card>
    )
  }

  const set = (name: keyof PersistedRole, value: string) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setServerError('')
  }

  // Initials default to "F. Last" from the name fields, but stay editable —
  // once the admin types their own value, it stops auto-updating.
  const { onManualChange: onInitialsChange } = useAutoField(
    deriveInitials(form.firstName, form.lastName),
    form.initials,
    (v) => set('initials', v),
  )

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof NewRole
    const found = validateAddRole({ ...full, [name]: e.target.value })
    setErrors((prev) => ({ ...prev, [name]: found[name] }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPassword(e.target.value)
    setErrors((prev) => ({ ...prev, password: undefined }))
    setServerError('')
  }

  const isValid = Object.keys(validateAddRole(full)).length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validateAddRole(full)
    if (Object.keys(found).length > 0) { setErrors(found); return }
    setErrors({})
    setSubmitting(true)
    const res = await addRole(full)
    setSubmitting(false)
    if (res.ok) { setCreatedId(res.userId ?? ''); setForm(empty); setPassword('') }
    else setServerError(res.error ?? 'Could not create the account.')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Add <GradientText>User</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Create a staff account. Their login ID is generated automatically and emailed to them with the password.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <SelectField label="Role *" name="role" value={form.role} onChange={(e) => { set('role', e.target.value); setErrors({}) }} options={roleOptions} error={errors.role} />

          {form.role === 'Bank' && (
            <>
              <SelectField label="Bank Name *" name="bankName" value={form.bankName} onChange={(e) => set('bankName', e.target.value)} options={bankOptions} error={errors.bankName} />
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Branch Name" name="branchName" value={form.branchName} onChange={(e) => set('branchName', e.target.value)} onBlur={handleBlur} error={errors.branchName} placeholder="e.g. Nugegoda" />
                <FormField label="Branch Code * (login ID)" name="branchCode" value={form.branchCode} onChange={(e) => set('branchCode', e.target.value)} onBlur={handleBlur} error={errors.branchCode} placeholder="e.g. SMPNGD045" />
                <FormField label="Designation" name="designation" value={form.designation} onChange={(e) => set('designation', e.target.value)} onBlur={handleBlur} error={errors.designation} placeholder="e.g. Branch Manager" />
              </div>
              <p className="-mt-2 text-xs text-emerald-200/60">
                The bank signs in on the External Login page as "Bank" using this Branch Code.
              </p>
            </>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {nameFields.map((f) => (
              <FormField key={f.name} label={f.label} name={f.name} type={f.type ?? 'text'} value={form[f.name]} onChange={(e) => set(f.name, e.target.value)} onBlur={handleBlur} error={errors[f.name]} />
            ))}

            <FormField
              label="Name with Initials (auto)"
              name="initials"
              value={form.initials}
              onChange={(e) => onInitialsChange(e.target.value)}
              onBlur={handleBlur}
              error={errors.initials}
              placeholder="e.g. K. Perera"
            />

            {contactFields.map((f) => (
              <FormField
                key={f.name}
                label={f.label}
                name={f.name}
                type={f.type ?? 'text'}
                value={form[f.name]}
                onChange={(e) => set(f.name, e.target.value)}
                onBlur={handleBlur}
                error={errors[f.name]}
                prefix={f.name === 'phone' ? '+94' : undefined}
                maxLength={f.name === 'phone' ? 9 : undefined}
                inputMode={f.name === 'phone' ? 'numeric' : undefined}
              />
            ))}

            <ProvinceDistrictFields
              province={form.province}
              district={form.district}
              onChange={(name, value) => set(name, value)}
              provinceError={errors.province}
              districtError={errors.district}
            />

            {addressFields
              .filter((f) => !(form.role === 'Bank' && f.name === 'dateOfBirth'))
              .map((f) => (
                <FormField key={f.name} label={f.label} name={f.name} type={f.type ?? 'text'} value={form[f.name]} onChange={(e) => set(f.name, e.target.value)} onBlur={handleBlur} error={errors[f.name]} max={f.type === 'date' ? today : undefined} />
              ))}

            <FormField label="Password *" name="password" type="password" value={password} onChange={handlePasswordChange} onBlur={handleBlur} error={errors.password} />
          </div>

          {serverError && <p className="text-sm text-red-300">{serverError}</p>}

          <Button type="submit" fullWidth disabled={!isValid} loading={submitting}>
            {submitting ? 'Creating…' : 'Add User'}
          </Button>
        </form>
      </Card>

      <Modal open={!!createdId} onClose={() => setCreatedId('')}>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">✓</div>
          <h3 className="mt-4 text-2xl"><GradientText>Account Created</GradientText></h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100/70">
            The new login ID is{' '}
            <span className="font-semibold text-gold-300">{createdId}</span>. An email with the ID and password has been sent, asking them to change it on first login.
          </p>
          <div className="mt-5 flex gap-3">
            <Button type="button" fullWidth onClick={() => setCreatedId('')}>Add Another</Button>
            <Button type="button" variant="outline" fullWidth onClick={() => navigate('/dashboard')}>Done</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AddRolePage
