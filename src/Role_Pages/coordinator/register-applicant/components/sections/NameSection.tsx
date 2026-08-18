import FormField from '@/Common_Pages/components/ui/FormField'
import FormSection from '@/Role_Pages/coordinator/register-applicant/components/FormSection'
import type { SectionProps } from '@/Role_Pages/coordinator/register-applicant/types/register-applicant'

// Personal information. Name parts required by the database are derived from
// the full name on submit, so the user only needs to enter the full name once.
const NameSection = ({ values, errors, onChange, onBlur }: SectionProps) => (
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
          autoComplete="off"
          preventAutofill
        />
        <p className="mt-1.5 text-xs text-emerald-200/50">
          Enter complete name — first, middle and last
        </p>
      </div>

      <FormField
        label="Business / Company Name (optional)"
        name="applicantBusinessName"
        value={values.applicantBusinessName}
        onChange={onChange}
        onBlur={onBlur}
        error={errors.applicantBusinessName}
        placeholder="e.g. M/S Kumudu Fashion Garment"
        autoComplete="off"
        preventAutofill
      />
    </FormSection>
)

export default NameSection
