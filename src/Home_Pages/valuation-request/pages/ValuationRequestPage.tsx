import { Link } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'

const ValuationRequestPage = () => (
  <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-300">Get started</p>
      <h1 className="mt-3 text-4xl font-bold text-white sm:text-5xl">
        Request a <GradientText>Land Valuation</GradientText>
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-emerald-100">
        Contact the CODEHUB valuation team with your property and lending details. A coordinator will review
        the request, register the applicant, and explain the documents required for the valuation.
      </p>
    </div>
    <Card className="mt-10 p-6 text-center sm:p-8">
      <h2 className="text-xl font-semibold text-white">Send your request to our coordinator</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-emerald-100">
        Use the contact form and include the property location, requesting bank and a telephone number.
        Existing applicants can sign in to follow their registered project.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link to="/contact"><Button type="button">Open contact form</Button></Link>
        <Link to="/login"><Button type="button" variant="outline">Sign in</Button></Link>
      </div>
    </Card>
  </section>
)

export default ValuationRequestPage
