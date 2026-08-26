import FormField from '@/Common_Pages/components/ui/FormField'
import FormSection from '@/Role_Pages/coordinator/register-applicant/components/FormSection'
import type { SectionProps } from '@/Role_Pages/coordinator/register-applicant/types/register-applicant'

// Personal information. Name parts required by the database are derived from
// the full name on submit, so the user only needs to enter the full name once.
const NameSection = ({ values, errors, onChange, onBlur }: SectionProps) => (
    <FormSection number={1} title="Personal information" description="Enter the applicant's legal name as shown on the NIC.">
      <div className="max-w-2xl">
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
          helperText="Enter the complete legal name as shown on the NIC."
        />
      </div>
    </FormSection>
)

export default NameSection
