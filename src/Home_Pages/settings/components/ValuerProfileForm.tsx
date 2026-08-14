import { useEffect, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import FormField from '@/Common_Pages/components/ui/FormField'
import { getValuerProfile, saveValuerProfile } from '@/Home_Pages/settings/api/valuerProfile'
import type { ValuerProfile } from '@/Home_Pages/settings/types/valuerProfile'

type Props = { userId: string; defaultName: string; onSaved: (message: string) => void }
type Errors = Partial<Record<keyof ValuerProfile, string>>

const blank = (userId: string, name: string): ValuerProfile => ({
  userId, valuerName: name, conflictOfInterest: 'No Conflict', conflictDetails: '',
  professionalQualifications: '', ivslRegistrationNumber: '', ricsRegistrationNumber: '', ricsMembership: '',
  relevantExperience: 'Confirmed', indemnityStatus: 'Not Available',
  indemnityPolicyNumber: '', indemnityExpiryDate: '',
})

const validate = (p: ValuerProfile): Errors => {
  const errors: Errors = {}
  if (!p.valuerName.trim()) errors.valuerName = 'Valuer name is required.'
  if (!p.ivslRegistrationNumber.trim()) errors.ivslRegistrationNumber = 'IVSL registration number is required.'
  return errors
}

const ValuerProfileForm = ({ userId, defaultName, onSaved }: Props) => {
  const [profile, setProfile] = useState(() => blank(userId, defaultName))
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState('')

  useEffect(() => {
    getValuerProfile(userId).then((res) => {
      if (res.profile) setProfile(res.profile)
      if (res.error) setServerError(res.error)
      setLoading(false)
    })
  }, [userId])

  const set = <K extends keyof ValuerProfile>(key: K, value: ValuerProfile[K]) => {
    setProfile((current) => ({ ...current, [key]: value }))
    setErrors((current) => ({ ...current, [key]: undefined }))
    setServerError('')
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const found = validate(profile)
    if (Object.keys(found).length) { setErrors(found); return }
    setSaving(true)
    const result = await saveValuerProfile(profile)
    setSaving(false)
    if (result.ok && result.profile) {
      setProfile(result.profile)
      onSaved('Your valuer professional profile has been saved.')
    } else setServerError(result.error ?? 'Could not save the valuer profile.')
  }

  if (loading) return <Card className="p-6 text-center text-sm text-emerald-100/60">Loading professional profile…</Card>

  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-white/10 bg-gradient-to-r from-gold-400/10 to-transparent px-6 py-5 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">Manager L1 · Report Signatory</p>
        <h2 className="mt-2 text-xl font-bold text-white">Valuer Professional Profile</h2>
        <p className="mt-1 text-sm text-emerald-100/65">Saved once and available for valuation reports and compliance statements.</p>
      </div>
      <form onSubmit={submit} className="space-y-8 p-6 sm:p-8" noValidate>
        <section>
          <h3 className="mb-4 font-semibold text-white">Professional identity</h3>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField label="Valuer Name *" name="valuerName" value={profile.valuerName} onChange={(e) => set('valuerName', e.target.value)} error={errors.valuerName} placeholder="Full name used to sign reports" />
            <FormField label="IVSL Registration Number *" name="ivslRegistrationNumber" value={profile.ivslRegistrationNumber} onChange={(e) => set('ivslRegistrationNumber', e.target.value)} error={errors.ivslRegistrationNumber} placeholder="e.g. F/315" />
            <FormField label="RICS Registration Number" name="ricsRegistrationNumber" value={profile.ricsRegistrationNumber} onChange={(e) => set('ricsRegistrationNumber', e.target.value)} placeholder="e.g. 6698015" />
            <FormField label="RICS Membership (optional)" name="ricsMembership" value={profile.ricsMembership} onChange={(e) => set('ricsMembership', e.target.value)} placeholder="e.g. FRICS or MRICS" />
          </div>
        </section>

        {serverError && <p className="rounded-xl border border-red-400/25 bg-red-400/10 p-3 text-sm text-red-200">{serverError}</p>}
        <Button type="submit" fullWidth disabled={saving}>{saving ? 'Saving Professional Profile…' : 'Save Professional Profile'}</Button>
      </form>
    </Card>
  )
}

export default ValuerProfileForm
