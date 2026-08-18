import ApplicantSearch from '@/Role_Pages/coordinator/create-project/components/ApplicantSearch'
import WorkflowStepper from '@/Role_Pages/coordinator/shared/WorkflowStepper'
import '@/Role_Pages/coordinator/create-project/styles/create-project-page.css'

// Coordinator > Register Applicant (step 1 of the valuation workflow).
// Search for an applicant before creating a project.
const CreateProjectPage = () => {
  return (
    <div>
      <WorkflowStepper current="register" />
      <ApplicantSearch />
    </div>
  )
}

export default CreateProjectPage
