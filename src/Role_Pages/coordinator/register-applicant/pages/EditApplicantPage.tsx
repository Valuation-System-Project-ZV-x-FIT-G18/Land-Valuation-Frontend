import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import RegisterApplicantForm from '@/Role_Pages/coordinator/register-applicant/components/RegisterApplicantForm'
import WorkflowStepper from '@/Role_Pages/coordinator/shared/WorkflowStepper'
import type { Applicant } from '@/Role_Pages/coordinator/create-project/types/create-project'
import '@/Role_Pages/coordinator/register-applicant/styles/register-applicant-page.css'

// Coordinator > Edit an existing loan applicant's details.
// The applicant to edit is passed in via navigation state (from the NIC-search
// result or the post-registration success screen).
const EditApplicantPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const applicant = (location.state as { applicant?: Applicant } | null)?.applicant

  // Reached without an applicant (e.g. a direct URL) — send back to search.
  if (!applicant?.nic) return <Navigate to="/coordinator/create-project" replace />

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

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Edit <GradientText>Applicant</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100">
          Correct this applicant&apos;s details. The NIC is their login ID and cannot be changed.
        </p>
      </div>

      <RegisterApplicantForm editApplicant={applicant} />
    </div>
  )
}

export default EditApplicantPage
