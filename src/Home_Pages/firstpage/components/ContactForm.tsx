import { useForm } from '@/Common_Pages/hooks/useForm'
import FormField from '@/Common_Pages/components/ui/FormField'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import { validateContact } from '@/Home_Pages/firstpage/components/validateContact'
import { submitContactMessage } from '@/Home_Pages/firstpage/api/home'
import type { ContactFormData } from '@/Home_Pages/firstpage/types/home'

// Contact form for the bottom of the homepage.
// All the state/validation/persistence/submit logic comes from useForm.

const emptyForm: ContactFormData = { name: '', email: '', phone: '', message: '' }

const ContactForm = () => {
  const f = useForm<ContactFormData>({
    initialValues: emptyForm,
    validate: validateContact,
    onSubmit: submitContactMessage,
    storageKey: 'contactForm', // persist on refresh, clear on submit/close
    transforms: { phone: (v) => v.replace(/\D/g, '').slice(0, 9) },
    successResetMs: 4000,
  })

  return (
    <section id="contact" className="mx-auto max-w-3xl px-4 py-20 sm:px-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Any <GradientText>inquiries?</GradientText>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-emerald-100/80">
          Have a question or need a valuation? Send us a message and our team
          will get back to you.
        </p>
      </div>

      <Card className="mt-10 p-6 sm:p-8">
        {f.submitted ? (
          <div className="py-10 text-center">
            <p className="text-2xl">
              <GradientText>Thank you!</GradientText>
            </p>
            <p className="mt-2 text-emerald-100/80">
              Your message has been received. We&apos;ll be in touch shortly.
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
                label="Email Address"
                name="email"
                type="email"
                value={f.values.email}
                onChange={f.handleChange}
                onBlur={f.handleBlur}
                error={f.errors.email}
                placeholder="you@example.com"
              />
            </div>

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

            <FormField
              label="Message"
              name="message"
              textarea
              value={f.values.message}
              onChange={f.handleChange}
              onBlur={f.handleBlur}
              error={f.errors.message}
              placeholder="How can we help you?"
            />

            {f.serverError && (
              <p className="text-sm text-red-300">{f.serverError}</p>
            )}

            <Button type="submit" fullWidth disabled={f.submitting}>
              {f.submitting ? 'Sending…' : 'Send Message'}
            </Button>
          </form>
        )}
      </Card>
    </section>
  )
}

export default ContactForm
