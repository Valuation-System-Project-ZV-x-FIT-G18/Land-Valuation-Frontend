import Stepper from '@/Role_Pages/coordinator/create-project/components/Stepper'
import ApplicantSearch from '@/Role_Pages/coordinator/create-project/components/ApplicantSearch'
import '@/Role_Pages/coordinator/create-project/styles/create-project-page.css'

// Coordinator > Create Project.
// Step 1 of 3: search a loan applicant by NIC or Project ID.
const CreateProjectPage = () => {
  return (
    <div>
      <div className="mb-6 flex justify-end">
        <Stepper current={1} />
      </div>

      <ApplicantSearch />
    </div>
  )
}

export default CreateProjectPage
