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
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'
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
  'Amana Bank', 'Bank of Ceylon', 'Cargills Bank', 'Commercial Bank of Ceylon',
  'DFCC Bank', 'Hatton National Bank', 'Indian Bank', 'Indian Overseas Bank',
  'MCB Bank', 'National Development Bank', 'Nations Trust Bank',
  'Pan Asia Banking Corporation', "People's Bank", 'Public Bank Berhad',
  'Sampath Bank', 'Seylan Bank', 'Standard Chartered Bank',
  'State Bank of India', 'Union Bank of Colombo',
].sort()

type PersistedRole = NewRole

const nameFields: { name: keyof PersistedRole; label: string; type?: string }[] = [
  { name: 'firstName', label: 'First Name *' },
  { name: 'lastName', label: 'Last Name *' },
]
const contactFields: { name: keyof PersistedRole; label: string; type?: string }[] = [
  { name: 'nic', label: 'NIC *' },
  { name: 'email', label: 'Email *', type: 'email' },
  { name: 'phone', label: 'Phone' },
]
const profileFields: { name: keyof PersistedRole; label: string; type?: string; placeholder?: string }[] = [
  { name: 'city', label: 'City', placeholder: 'e.g. Colombo' },
  { name: 'postalCode', label: 'Postal Code', placeholder: 'e.g. 10250' },
  { name: 'address', label: 'Address', placeholder: 'Residential address' },
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
]
const empty: PersistedRole = {
  role: '', firstName: '', lastName: '', nic: '', email: '', phone: '',
  district: '', province: '', city: '', postalCode: '', address: '', dateOfBirth: '',
  branchCode: '', branchName: '', bankName: '', designation: '',
}

// Admin > Add Role. Create a staff account; the person is emailed their login.
const AddRolePage = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useSessionState<PersistedRole>('addUserV2', empty)
  const [errors, setErrors] = useState<RoleErrors>({})
  const [serverError, setServerError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [createdId, setCreatedId] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)

  const full: NewRole = form

  if (user && user.role !== 'Admin') {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <p className="font-semibold text-accent-200">Admins only</p>
        <p className="mt-1 text-sm text-emerald-100">You don&apos;t have permission to add roles.</p>
      </Card>
    )
  }

  const set = (name: keyof PersistedRole, value: string) => {
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setServerError('')
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const name = e.target.name as keyof NewRole
    const found = validateAddRole({ ...full, [name]: e.target.value })
    setErrors((prev) => ({ ...prev, [name]: found[name] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validateAddRole(full)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      if (found.province || found.district || found.city || found.postalCode || found.address || found.dateOfBirth) setProfileOpen(true)
      return
    }
    setErrors({})
    setSubmitting(true)
    const res = await addRole(full)
    setSubmitting(false)
    if (res.ok) { setCreatedId(res.userId ?? ''); setForm(empty) }
    else {
      const message = res.error ?? 'Could not create the account. Please check the entered details.'
      const lower = message.toLowerCase()
      if (lower.includes('email')) setErrors((current) => ({ ...current, email: message }))
      else if (lower.includes('nic')) setErrors((current) => ({ ...current, nic: message }))
      else setServerError(message)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">User Management</p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Create <GradientText>User Account</GradientText>
        </h1>
        <p className="mt-2 max-w-2xl text-emerald-100">
          Set up secure access for an internal team member.
        </p>
      </div>

      <Card className="overflow-hidden">
        <form onSubmit={handleSubmit} noValidate className="space-y-7 p-6 sm:p-8">
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Access role</h2>
              <p className="text-sm text-emerald-100">Choose the minimum access this person needs.</p>
            </div>
          <SelectField label="Role *" name="role" value={form.role} onChange={(e) => { set('role', e.target.value); setErrors({}) }} options={roleOptions} error={errors.role} />

          {form.role === 'Bank' && (
            <div className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Registered bank *"
                name="bankName"
                value={form.bankName}
                onChange={(e) => set('bankName', e.target.value)}
                options={[{ value: '', label: 'Select a bank' }, ...BANK_NAMES.map((name) => ({ value: name, label: name }))]}
                error={errors.bankName}
              />
              <FormField label="Official branch code *" name="branchCode" value={form.branchCode} onChange={(e) => set('branchCode', e.target.value.replace(/\D/g, ''))} error={errors.branchCode} helperText="Use the code registered in Bank Management." />
              <FormField label="Branch name" name="branchName" value={form.branchName} onChange={(e) => set('branchName', e.target.value)} />
              <FormField label="Designation" name="designation" value={form.designation} onChange={(e) => set('designation', e.target.value)} />
            </div>
          )}

          </section>

          <section className="space-y-4 border-t border-white/10 pt-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Identity & contact</h2>
            <p className="text-sm text-emerald-100">Used for sign-in, notifications, and the staff directory.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {nameFields.map((f) => (
              <FormField key={f.name} label={f.label} name={f.name} type={f.type ?? 'text'} value={form[f.name]} onChange={(e) => set(f.name, e.target.value)} onBlur={handleBlur} error={errors[f.name]} />
            ))}

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

          </div>
          </section>

          <details open={profileOpen} onToggle={(event) => setProfileOpen(event.currentTarget.open)} className="group rounded-2xl border border-white/10 bg-white/[0.025]">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
              <div>
                <span className="font-semibold text-white">Additional profile details</span>
                <span className="ml-2 text-xs text-emerald-100">Optional</span>
              </div>
              <span className="text-emerald-100 transition-transform group-open:rotate-180">⌄</span>
            </summary>
            <div className="grid gap-5 border-t border-white/10 p-5 sm:grid-cols-2">
              <ProvinceDistrictFields
                province={form.province}
                district={form.district}
                onChange={(name, value) => set(name, value)}
                provinceError={errors.province}
                districtError={errors.district}
              />
              {profileFields.map((field) => (
                <FormField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  type={field.type ?? 'text'}
                  value={form[field.name]}
                  placeholder={field.placeholder}
                  onChange={(event) => set(field.name, event.target.value)}
                  onBlur={handleBlur}
                  error={errors[field.name]}
                  max={field.type === 'date' ? today : undefined}
                  inputMode={field.name === 'postalCode' ? 'numeric' : undefined}
                  maxLength={field.name === 'postalCode' ? 5 : undefined}
                />
              ))}
            </div>
          </details>

          {serverError && <p className="text-sm text-red-300">{serverError}</p>}

          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={() => navigate('/admin/user-details')}>Cancel</Button>
            <Button type="submit" loading={submitting}>
              {submitting ? 'Creating…' : 'Create Account'}
            </Button>
          </div>
        </form>
      </Card>

      <Modal open={!!createdId} onClose={() => setCreatedId('')}>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">✓</div>
          <h3 className="mt-4 text-2xl"><GradientText>Account Created</GradientText></h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100">
            The new account ID is{' '}
            <span className="font-semibold text-accent-300">{createdId}</span>. An email with the sign-in email address and temporary password has been sent.
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
