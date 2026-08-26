import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'

// Simple "About" page describing the CODEHUB Land Valuation System.
const points = [
  { title: 'Our Purpose', text: 'To make land valuation in Sri Lanka faster, accurate and transparent for banks, valuers and applicants.' },
  { title: 'Trusted Standards', text: 'Valuations follow IVSL, RICS and IVSC guidance, prepared by RICS-registered chartered valuation surveyors.' },
  { title: 'End-to-End', text: 'From the applicant request to inspection, AI-assisted report drafting, multi-level review and secure release.' },
]

const AboutPage = () => (
  <section className="mx-auto max-w-5xl px-4 py-14 sm:px-8">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-white sm:text-5xl">
        About <GradientText>CODEHUB</GradientText>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
        CODEHUB is a modern land valuation platform that connects loan applicants, banks, technical officers and
        managers in one streamlined workflow — from the first request all the way to a finalised, professionally
        reviewed valuation report.
      </p>
    </div>

    <div className="mt-10 grid gap-4 sm:grid-cols-3">
      {points.map((p) => (
        <Card key={p.title} className="p-6 text-center">
          <h3 className="font-semibold text-accent-300">{p.title}</h3>
          <p className="mt-2 text-sm text-emerald-100">{p.text}</p>
        </Card>
      ))}
    </div>
  </section>
)

export default AboutPage
