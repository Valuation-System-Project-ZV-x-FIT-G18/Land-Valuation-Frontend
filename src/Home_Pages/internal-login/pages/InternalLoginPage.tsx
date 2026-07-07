import { useNavigate } from 'react-router-dom'
import '@/Home_Pages/internal-login/styles/internal-login-page.css'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Button from '@/Common_Pages/components/ui/Button'
import InternalLoginForm from '@/Home_Pages/internal-login/components/InternalLoginForm'

// Internal (staff) login page.
const InternalLogin = () => {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-8">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-8 !px-5 !py-2.5 text-sm"
      >
        ← Back
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Internal <GradientText>Login</GradientText>
        </h1>
        <p className="mt-3 text-emerald-100/80">
          Sign in for valuation team staff.
        </p>
      </div>

      <InternalLoginForm />
    </section>
  )
}

export default InternalLogin
