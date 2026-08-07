import FormField from '@/Common_Pages/components/ui/FormField'
import FormSection from '@/Role_Pages/coordinator/register-applicant/components/FormSection'
import type { SectionProps } from '@/Role_Pages/coordinator/register-applicant/types/register-applicant'

const today = new Date().toISOString().slice(0, 10)

// Identity & contact details: NIC, date of birth, phone, email, password.
const IdentityContactSection = ({ values, errors, onChange, onBlur }: SectionProps) => (
  <FormSection title="Identity & contact">
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="NIC *" name="nic" value={values.nic} onChange={onChange} onBlur={onBlur} error={errors.nic} placeholder="e.g. 200012345678" />
      <FormField label="Date of birth *" name="dateOfBirth" type="date" max={today} value={values.dateOfBirth} onChange={onChange} onBlur={onBlur} error={errors.dateOfBirth} />
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Mobile number *" name="phone" type="tel" inputMode="numeric" prefix="+94" maxLength={9} value={values.phone} onChange={onChange} onBlur={onBlur} error={errors.phone} placeholder="e.g. 771234567" />
      <FormField label="Email *" name="email" type="email" value={values.email} onChange={onChange} onBlur={onBlur} error={errors.email} placeholder="e.g. name@gmail.com" />
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <FormField label="Password *" name="password" type="password" value={values.password} onChange={onChange} onBlur={onBlur} error={errors.password} placeholder="8+ chars, upper, lower, digit & symbol" />
      <FormField label="Confirm password *" name="confirmPassword" type="password" value={values.confirmPassword} onChange={onChange} onBlur={onBlur} error={errors.confirmPassword} placeholder="Re-enter password" />
    </div>
  </FormSection>
)

export default IdentityContactSection
