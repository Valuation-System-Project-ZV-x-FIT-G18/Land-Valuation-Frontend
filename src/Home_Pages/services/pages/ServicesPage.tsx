import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// Simple "Services" page listing what CODEHUB offers.
const services = [
  { title: 'Land Valuation', text: 'Market value and forced sale value assessments for bare land, prepared using the comparison and contractor’s test methods.' },
  { title: 'Site Inspection', text: 'On-site inspections capturing extent, boundaries, access, soil and locality details.' },
  { title: 'Site Photography', text: 'Geo-referenced site photographs with AI-assisted descriptions for the report.' },
  { title: 'GPS & Mapping', text: 'Precise location pinning with satellite and map imagery and an access-route description.' },
  { title: 'AI Report Drafting', text: 'Automatic drafting of the descriptive report sections from the collected data.' },
  { title: 'Bank-Ready Reports', text: 'Multi-level managerial review, locking and secure release of the final report to the requesting bank.' },
]

const ServicesPage = () => (
  <section className="mx-auto max-w-5xl px-4 py-14 sm:px-8">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white sm:text-5xl">
        Our <GradientText>Services</GradientText>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
        Everything needed to take a land valuation from request to a finalised, bank-ready report.
      </p>
    </div>

    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <Card key={s.title} className="p-6">
          <h3 className="font-semibold text-accent-300">{s.title}</h3>
          <p className="mt-2 text-sm text-emerald-100">{s.text}</p>
        </Card>
      ))}
    </div>
  </section>
)

export default ServicesPage
