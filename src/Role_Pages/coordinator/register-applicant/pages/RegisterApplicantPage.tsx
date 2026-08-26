import { useLocation, useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import RegisterApplicantForm from '@/Role_Pages/coordinator/register-applicant/components/RegisterApplicantForm'
import WorkflowStepper from '@/Role_Pages/coordinator/shared/WorkflowStepper'
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

      <WorkflowStepper current="register" />

      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">Applicant management</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
          Register <GradientText>Applicant</GradientText>
        </h1>
        <p className="mt-2 max-w-2xl text-emerald-100">
          Create the property owner&apos;s account first. Property and valuation details are added in the following steps.
        </p>
      </div>

      <RegisterApplicantForm initialNic={nic} />
    </div>
  )
}

export default RegisterApplicantPage
