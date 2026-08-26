import { useNavigate } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Button from '@/Common_Pages/components/ui/Button'
import EmailPasswordLoginForm from '@/Home_Pages/login/components/EmailPasswordLoginForm'

// The single sign-in page for everyone — staff, banks and customers alike.
//
// There is deliberately no "internal or external?" choice. Which portal an
// account belongs to is a fact the system already knows from the account's
// role; asking the person to classify themselves only creates a way to get it
// wrong, and rejects correct credentials when they pick the other side.
const LoginPage = () => {
  const navigate = useNavigate()

  return (
    <section className="mx-auto max-w-md px-4 py-16 sm:px-8">
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate('/')}
        className="mb-8 !px-5 !py-2.5 text-sm"
      >
        ← Back
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Sign <GradientText>In</GradientText>
        </h1>
        <p className="mt-3 text-emerald-100">
          Use the email address your account was created with.
        </p>
      </div>

      <EmailPasswordLoginForm />
    </section>
  )
}

export default LoginPage
