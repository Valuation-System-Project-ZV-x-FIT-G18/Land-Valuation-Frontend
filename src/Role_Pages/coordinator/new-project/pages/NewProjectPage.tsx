import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import Modal from '@/Common_Pages/components/ui/Modal'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import ProjectForm from '@/Role_Pages/coordinator/new-project/components/ProjectForm'
import '@/Role_Pages/coordinator/new-project/styles/new-project-page.css'

// Coordinator > Create Project.
// Enter a NIC to unlock the form; on submit a popup confirms the new project id
// and asks whether this is a revaluation.
const NewProjectPage = () => {
  const navigate = useNavigate()
  const [done, setDone] = useState<{ projectId: string; nic: string } | null>(null)

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Create <GradientText>Project</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Enter the applicant&apos;s NIC, then complete the land valuation details.
        </p>
      </div>

      <ProjectForm onDone={(projectId, nic) => setDone({ projectId, nic })} />

      {/* Success popup */}
      <Modal open={!!done} onClose={() => navigate('/dashboard')}>
        {done && (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">
              ✓
            </div>
            <h3 className="mt-4 text-2xl">
              <GradientText>Project Created Successfully</GradientText>
            </h3>

            <dl className="mx-auto mt-5 max-w-xs space-y-2 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-emerald-200/60">NIC</dt>
                <dd className="font-medium text-white">{done.nic}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-emerald-200/60">Project ID</dt>
                <dd className="font-semibold text-gold-300">{done.projectId}</dd>
              </div>
            </dl>

            <p className="mt-6 font-medium text-white">Create a valuation for this project?</p>
            <div className="mt-3 flex gap-3">
              <Button
                type="button"
                fullWidth
                onClick={() =>
                  navigate('/coordinator/new-valuation', {
                    state: { nic: done.nic, projectId: done.projectId },
                  })
                }
              >
                Yes, new valuation
              </Button>
              <Button type="button" variant="outline" fullWidth onClick={() => navigate('/dashboard')}>
                No
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default NewProjectPage
