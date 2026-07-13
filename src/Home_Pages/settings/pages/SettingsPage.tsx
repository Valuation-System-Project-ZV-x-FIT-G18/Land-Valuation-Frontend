import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { getProfile, updateProfile } from '@/Home_Pages/settings/api/settings'
import { validateSettings, type SettingsErrors } from '@/Home_Pages/settings/pages/validateSettings'
import type { Profile } from '@/Home_Pages/settings/types/settings'

// Editable personal fields (identity fields user_id / role / nic are read-only).
const fields: { name: keyof Profile; label: string; type?: string }[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'initials', label: 'Name with Initials' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone' },
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
  { name: 'province', label: 'Province' },
  { name: 'district', label: 'District' },
  { name: 'city', label: 'City' },
  { name: 'postalCode', label: 'Postal Code' },
  { name: 'address', label: 'Address' },
]

// Settings — available to every logged-in role. Edit your personal info; changes
// are saved to the users table.
const SettingsPage = () => {
  const { user, login } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<SettingsErrors>({})
  const [serverError, setServerError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (!user) return
    getProfile(user.userId).then((res) => {
      if (res.profile) setProfile(res.profile)
      else setServerError(res.error ?? 'Could not load your profile.')
      setLoading(false)
    })
  }, [user])

  if (!user) return null
  if (loading) return <p className="text-center text-sm text-emerald-200/60">Loading your settings…</p>
  if (!profile) return <p className="text-center text-sm text-red-300">{serverError || 'Profile not found.'}</p>

  const set = (name: keyof Profile, value: string) => {
    setProfile((p) => (p ? { ...p, [name]: value } : p))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
    setNotice('')
    setServerError('')
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return
    const name = e.target.name as keyof Profile
    const found = validateSettings(profile)
    setErrors((prev) => ({ ...prev, [name]: found[name] }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validateSettings(profile)
    if (Object.keys(found).length > 0) { setErrors(found); return }
    setErrors({})
    setSaving(true)
    const res = await updateProfile(profile)
    setSaving(false)
    if (res.ok && res.profile) {
      setProfile(res.profile)
      login({ ...user, name: `${res.profile.firstName} ${res.profile.lastName}` })
      setNotice('Your changes have been saved.')
    } else {
      setServerError(res.error ?? 'Could not save your changes.')
    }
  }

  const isValid = Object.keys(validateSettings(profile)).length === 0

  const identity: [string, string][] = [
    ['Login ID', profile.userId],
    ['Role', profile.role],
    ['NIC', profile.nic],
  ]

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          <GradientText>Settings</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Update your personal information. These changes are saved to your account.
        </p>
      </div>

      {/* Read-only identity */}
      <Card className="grid gap-4 p-6 sm:grid-cols-3">
        {identity.map(([k, v]) => (
          <div key={k}>
            <p className="text-xs uppercase tracking-wide text-emerald-200/50">{k}</p>
            <p className="mt-1 text-sm font-semibold text-white">{v || '—'}</p>
          </div>
        ))}
      </Card>

      {/* Editable fields */}
      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSave} noValidate className="grid gap-5 sm:grid-cols-2">
          {fields.map((f) => (
            <FormField
              key={f.name}
              label={f.label}
              name={f.name}
              type={f.type ?? 'text'}
              value={profile[f.name] ?? ''}
              onChange={(e) => set(f.name, e.target.value)}
              onBlur={handleBlur}
              error={errors[f.name]}
            />
          ))}

          {serverError && <p className="text-sm text-red-300 sm:col-span-2">{serverError}</p>}
          {notice && <p className="text-sm text-emerald-200 sm:col-span-2">{notice}</p>}

          <div className="sm:col-span-2">
            <Button type="submit" fullWidth disabled={saving || !isValid}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default SettingsPage
