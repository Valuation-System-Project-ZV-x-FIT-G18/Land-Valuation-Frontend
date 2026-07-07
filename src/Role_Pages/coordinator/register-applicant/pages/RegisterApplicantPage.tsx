import { useLocation, useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import RegisterApplicantForm from '@/Role_Pages/coordinator/register-applicant/components/RegisterApplicantForm'
import '@/Role_Pages/coordinator/register-applicant/styles/register-applicant-page.css'

// Coordinator > Register a new loan applicant.
// The NIC is passed in from the "Create Project" search (via navigation state).
const RegisterApplicantPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const nic = (location.state as { nic?: string } | null)?.nic ?? ''

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate(-1)}
        className="mb-6 !px-5 !py-2.5 text-sm"
      >
        ← Back
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Register <GradientText>Loan Applicant</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Add a new loan applicant to the system.
        </p>
      </div>

      <RegisterApplicantForm initialNic={nic} />
    </div>
  )
}

export default RegisterApplicantPage
