import Card from '@/Common_Pages/components/ui/Card'
import LineIcon, { type LineIconName } from '@/Common_Pages/components/ui/LineIcon'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import ContactForm from '@/Home_Pages/firstpage/components/ContactForm'

// Simple "Contact" page — contact details + the existing message form.
const details: { label: string; value: string; icon: LineIconName }[] = [
  { icon: 'mail', label: 'Email', value: 'landvaluation.codehub@gmail.com' },
  { icon: 'phone', label: 'Phone', value: '+94 11 234 5678' },
  { icon: 'pin', label: 'Address', value: 'Moratuwa, Sri Lanka' },
]

const ContactPage = () => (
  <section className="mx-auto max-w-5xl px-4 py-14 sm:px-8">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white sm:text-5xl">
        Contact <GradientText>Us</GradientText>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
        Have a question about a valuation or need help getting started? Send us a message and we’ll get back to you.
      </p>
    </div>

    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      {details.map((d) => (
        <Card key={d.label} className="p-6 text-center">
          <span className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-accent-50 text-accent-200">
            <LineIcon name={d.icon} />
          </span>
          <p className="text-[11px] uppercase tracking-wide text-emerald-200">{d.label}</p>
          <p className="mt-1 text-sm font-medium text-white">{d.value}</p>
        </Card>
      ))}
    </div>

    <div className="mt-8">
      <ContactForm />
    </div>
  </section>
)

export default ContactPage
