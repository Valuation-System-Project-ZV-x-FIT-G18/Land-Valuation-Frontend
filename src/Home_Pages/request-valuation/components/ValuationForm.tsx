import { useForm } from '@/Common_Pages/hooks/useForm'
import FormField from '@/Common_Pages/components/ui/FormField'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { validateValuation } from '@/Home_Pages/request-valuation/components/validateValuation'
import { submitValuationRequest } from '@/Home_Pages/request-valuation/api/request-valuation'
import type { ValuationFormData } from '@/Home_Pages/request-valuation/types/request-valuation'

// Land valuation request form. State/validation/persistence/submit via useForm.

const emptyForm: ValuationFormData = {
  name: '',
  phone: '',
  email: '',
  nic: '',
  message: '',
}

const ValuationForm = () => {
  const f = useForm<ValuationFormData>({
    initialValues: emptyForm,
    validate: validateValuation,
    onSubmit: submitValuationRequest,
    storageKey: 'valuationForm', // persist on refresh, clear on submit/close
    transforms: { phone: (v) => v.replace(/\D/g, '').slice(0, 9) },
    successResetMs: 4000,
  })

  return (
    <Card className="mx-auto mt-10 max-w-2xl p-6 sm:p-8">
      {f.submitted ? (
        <div className="py-10 text-center">
          <p className="text-2xl">
            <GradientText>Request Received!</GradientText>
          </p>
          <p className="mt-2 text-emerald-100/80">
            Thank you. Our valuation team will contact you shortly.
          </p>
        </div>
      ) : (
        <form onSubmit={f.handleSubmit} noValidate className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              label="Full Name"
              name="name"
              value={f.values.name}
              onChange={f.handleChange}
              onBlur={f.handleBlur}
              error={f.errors.name}
              placeholder="John Perera"
            />
            <FormField
              label="Phone Number"
              name="phone"
              type="tel"
              prefix="+94"
              maxLength={9}
              inputMode="numeric"
              value={f.values.phone}
              onChange={f.handleChange}
              onBlur={f.handleBlur}
              error={f.errors.phone}
              placeholder="771234567"
            />
          </div>

          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={f.values.email}
            onChange={f.handleChange}
            onBlur={f.handleBlur}
            error={f.errors.email}
            placeholder="you@example.com"
          />

          <FormField
            label="NIC Number"
            name="nic"
            value={f.values.nic}
            onChange={f.handleChange}
            onBlur={f.handleBlur}
            error={f.errors.nic}
            placeholder="e.g. 200012345678 or 851234567V"
          />

          <FormField
            label="Message"
            name="message"
            textarea
            value={f.values.message}
            onChange={f.handleChange}
            onBlur={f.handleBlur}
            error={f.errors.message}
            placeholder="Anything else we should know about the land?"
          />

          {f.serverError && (
            <p className="text-sm text-red-300">{f.serverError}</p>
          )}

          <Button type="submit" fullWidth disabled={f.submitting || !f.isValid}>
            {f.submitting ? 'Submitting…' : 'Submit Request'}
          </Button>
        </form>
      )}
    </Card>
  )
}

export default ValuationForm
