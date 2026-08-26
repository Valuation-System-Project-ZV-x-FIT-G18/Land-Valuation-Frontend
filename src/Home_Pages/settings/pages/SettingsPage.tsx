import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Avatar from '@/Common_Pages/components/ui/Avatar'
import ProvinceDistrictFields from '@/Common_Pages/components/ui/ProvinceDistrictFields'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import { getProfile, updateProfile, uploadAvatar } from '@/Home_Pages/settings/api/settings'
import { validateSettings, type SettingsErrors } from '@/Home_Pages/settings/pages/validateSettings'
import type { Profile } from '@/Home_Pages/settings/types/settings'
import ValuerProfileForm from '@/Home_Pages/settings/components/ValuerProfileForm'

const today = new Date().toISOString().slice(0, 10)

// Editable personal fields (identity fields user_id / role / nic are read-only).
// Province/District are rendered separately as a cascading select pair.
const fields: { name: keyof Profile; label: string; type?: string }[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Phone' },
  { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
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
  const [uploading, setUploading] = useState(false)
  const [section, setSection] = useState<'profile' | 'security'>('profile')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edits-in-progress survive a refresh (keyed per user, so accounts never mix).
  const storageKey = user ? `settings:${user.userId}` : ''

  useEffect(() => {
    if (!user) return
    let draft: Profile | null = null
    try {
      const saved = sessionStorage.getItem(storageKey)
      if (saved) draft = JSON.parse(saved) as Profile
    } catch {
      /* ignore unreadable/corrupt draft */
    }

    getProfile().then((res) => {
      if (res.profile) setProfile(draft ?? res.profile)
      else setServerError(res.error ?? 'Could not load your profile.')
      setLoading(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Save every change so a refresh mid-edit doesn't lose it.
  useEffect(() => {
    if (!profile || !storageKey) return
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(profile))
    } catch {
      /* ignore storage errors (e.g. private mode limits) */
    }
  }, [profile, storageKey])

  if (!user) return null
  if (loading) return <p className="text-center text-sm text-emerald-200">Loading your settings…</p>
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !profile) return
    setUploading(true)
    setServerError('')
    const res = await uploadAvatar(file)
    setUploading(false)
    if (res.ok && res.photoPath) {
      setProfile({ ...profile, photoPath: res.photoPath })
      login({ ...user, photoPath: res.photoPath })
      setNotice('Your profile picture has been updated.')
    } else {
      setServerError(res.error ?? 'Could not upload your picture.')
    }
  }

  const isValid = Object.keys(validateSettings(profile)).length === 0

  const identity: [string, string][] = [
    ['Login ID', profile.userId],
    ['Role', profile.role],
    ['NIC', profile.nic],
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <SuccessModal
        open={!!notice}
        title="Update Successful"
        message={notice}
        closeLabel="Done"
        onClose={() => setNotice('')}
      />
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">Account</p>
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          <GradientText>Settings</GradientText>
        </h1>
        <p className="mt-2 max-w-md text-emerald-100">
          Manage your profile and account security.
        </p>
      </div>

      <div className="inline-flex rounded-xl border border-white/10 bg-surface p-1">
        <button type="button" onClick={() => setSection('profile')} className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${section === 'profile' ? 'bg-accent-300 text-emerald-950' : 'text-emerald-100 hover:text-white'}`}>Profile</button>
        <button type="button" onClick={() => setSection('security')} className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition ${section === 'security' ? 'bg-accent-300 text-emerald-950' : 'text-emerald-100 hover:text-white'}`}>Security</button>
      </div>

      {/* Profile picture */}
      {section === 'profile' && <Card className="flex items-center gap-5 p-6">
        <Avatar userId={user.userId} name={user.name} photoPath={profile.photoPath} size="lg" />
        <div>
          <p className="text-sm font-semibold text-white">Profile picture</p>
          <p className="mt-0.5 text-xs text-emerald-100">JPG, PNG or WEBP. Max 5MB.</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Change Photo'}
          </Button>
        </div>
      </Card>}

      {/* Read-only identity */}
      {section === 'profile' && <Card className="grid gap-4 p-6 sm:grid-cols-3">
        {identity.map(([k, v]) => (
          <div key={k}>
            <p className="text-xs uppercase tracking-wide text-emerald-200">{k}</p>
            <p className="mt-1 text-sm font-semibold text-white">{v || '—'}</p>
          </div>
        ))}
      </Card>}

      {/* Editable fields */}
      {section === 'profile' && <Card className="p-6 sm:p-8">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-white">Personal information</h2>
        </div>
        <form onSubmit={handleSave} noValidate className="grid gap-5 sm:grid-cols-2">
          {fields
            .filter((f) => !(profile.role === 'Bank' && f.name === 'dateOfBirth'))
            .map((f) => (
            <FormField
              key={f.name}
              label={f.label}
              name={f.name}
              type={f.type ?? 'text'}
              value={profile[f.name] ?? ''}
              onChange={(e) => set(f.name, e.target.value)}
              onBlur={handleBlur}
              error={errors[f.name]}
              prefix={f.name === 'phone' ? '+94' : undefined}
              maxLength={f.name === 'phone' ? 9 : undefined}
              inputMode={f.name === 'phone' ? 'numeric' : undefined}
              max={f.type === 'date' ? today : undefined}
            />
          ))}

          <ProvinceDistrictFields
            province={profile.province ?? ''}
            district={profile.district ?? ''}
            onChange={(name, value) => set(name, value)}
            provinceError={errors.province}
            districtError={errors.district}
          />

          {serverError && <p className="text-sm text-red-300 sm:col-span-2">{serverError}</p>}
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" disabled={saving || !isValid}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>}

      {section === 'security' && <Card className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <h2 className="text-lg font-semibold text-white">Sign-in password</h2>
          <p className="mt-1 text-sm text-emerald-100">Use a strong, unique password for this account.</p>
        </div>
        <Link to="/change-password" className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-accent-300/60 hover:bg-white/10">
          Change Password
        </Link>
      </Card>}

      {section === 'profile' && user.role === 'Manager L1' && (
        <ValuerProfileForm
          userId={user.userId}
          defaultName={`${profile.firstName} ${profile.lastName}`.trim()}
          onSaved={setNotice}
        />
      )}
    </div>
  )
}

export default SettingsPage
