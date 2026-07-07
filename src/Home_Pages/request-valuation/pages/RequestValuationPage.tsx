import { useNavigate } from 'react-router-dom'
import '@/Home_Pages/request-valuation/styles/request-valuation-page.css'
import ValuationForm from '@/Home_Pages/request-valuation/components/ValuationForm'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Button from '@/Common_Pages/components/ui/Button'

// "Request a Valuation" page.
// The Header + background come from the shared Layout,
// so this page just renders its heading and the valuation form.
const RequestValuation = () => {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-8">
      {/* Back button: returns to the previous page */}
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-8 !px-5 !py-2.5 text-sm"
      >
        <span className="transition-transform duration-200 group-hover:-translate-x-1">
          ←
        </span>
        Back
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Request a <GradientText>Land Valuation</GradientText>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-emerald-100/80">
          Fill in your details and the land location, and our team will get
          back to you with the next steps.
        </p>
      </div>

      <ValuationForm />
    </section>
  )
}

export default RequestValuation
