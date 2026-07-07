import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// Simple "Services" page listing what CODEHUB offers.
const services = [
  { icon: '📐', title: 'Land Valuation', text: 'Market value and forced sale value assessments for bare land, prepared using the comparison and contractor’s test methods.' },
  { icon: '📝', title: 'Site Inspection', text: 'On-site inspections capturing extent, boundaries, access, soil and locality details.' },
  { icon: '📷', title: 'Site Photography', text: 'Geo-referenced site photographs with AI-assisted descriptions for the report.' },
  { icon: '🗺️', title: 'GPS & Mapping', text: 'Precise location pinning with satellite and map imagery and an access-route description.' },
  { icon: '🤖', title: 'AI Report Drafting', text: 'Automatic drafting of the descriptive report sections from the collected data.' },
  { icon: '🏦', title: 'Bank-Ready Reports', text: 'Multi-level managerial review, locking and secure release of the final report to the requesting bank.' },
]

const ServicesPage = () => (
  <section className="mx-auto max-w-5xl px-4 py-14 sm:px-8">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white sm:text-5xl">
        Our <GradientText>Services</GradientText>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-emerald-100/80">
        Everything needed to take a land valuation from request to a finalised, bank-ready report.
      </p>
    </div>

    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <Card key={s.title} className="p-6">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gold-400/10 text-2xl">{s.icon}</div>
          <h3 className="font-semibold text-gold-300">{s.title}</h3>
          <p className="mt-2 text-sm text-emerald-100/70">{s.text}</p>
        </Card>
      ))}
    </div>
  </section>
)

export default ServicesPage
