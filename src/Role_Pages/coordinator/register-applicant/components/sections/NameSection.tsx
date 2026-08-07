import FormField from '@/Common_Pages/components/ui/FormField'
import FormSection from '@/Role_Pages/coordinator/register-applicant/components/FormSection'
import { deriveName } from '@/Role_Pages/coordinator/register-applicant/lib/deriveName'
import type { SectionProps } from '@/Role_Pages/coordinator/register-applicant/types/register-applicant'

const noop = () => {}

// Personal information > Name. Shows the full name + the auto-derived parts.
// "Name with initials" defaults from the full name but stays editable.
const NameSection = ({ values, errors, onChange, onBlur }: SectionProps) => {
  const { firstName, lastName } = deriveName(values.fullName)

  return (
    <FormSection icon="👤" title="Personal information">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-200/40">
        Name
      </p>

      <div>
        <FormField
          label="Full name *"
          name="fullName"
          value={values.fullName}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.fullName}
          placeholder="e.g. Chaminda Prasad Senarathne"
        />
        <p className="mt-1.5 text-xs text-emerald-200/50">
          Enter complete name — first, middle and last
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField label="First name (auto)" name="firstName" value={firstName || '—'} onChange={noop} readOnly />
        <FormField label="Last name (auto)" name="lastName" value={lastName || '—'} onChange={noop} readOnly />
        <FormField
          label="Name with initials (auto)"
          name="initials"
          value={values.initials}
          onChange={onChange}
          onBlur={onBlur}
          error={errors.initials}
          placeholder="e.g. C.P. Senarathne"
        />
      </div>
    </FormSection>
  )
}

export default NameSection
