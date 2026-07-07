import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import Modal from '@/Common_Pages/components/ui/Modal'
import { lookupProject } from '@/Role_Pages/coordinator/new-valuation/api/new-valuation'

// Top of the New Valuation form: find an existing project by NIC or Project ID.
// If found, the form unlocks. If not, a popup redirects to Create Project.
type ProjectLookupProps = {
  onFound: (projectId: string, nic: string) => void
}

const ProjectLookup = ({ onFound }: ProjectLookupProps) => {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [lastQ, setLastQ] = useState('')

  const check = async () => {
    if (!q.trim()) {
      setError('Enter a NIC or Project ID.')
      return
    }
    setError('')
    setChecking(true)
    const res = await lookupProject(q)
    setChecking(false)
    if (res.found && res.project) {
      onFound(res.project.projectId, res.project.nic)
    } else if (res.error) {
      setError(res.error)
    } else {
      setLastQ(q.trim())
      setNotFound(true)
    }
  }

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="mb-1 text-lg font-bold text-white">Project (NIC or Project ID)</h2>
      <p className="mb-5 text-sm text-emerald-100/70">
        Enter the applicant&apos;s NIC or the Project ID to load its valuation.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <FormField
            label="NIC or Project ID"
            name="projectLookup"
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setError('')
            }}
            error={error}
            placeholder="e.g. 200012345678 or pro001"
          />
        </div>
        <Button type="button" onClick={check} disabled={checking} className="sm:mt-7">
          {checking ? 'Checking…' : 'Check'}
        </Button>
      </div>

      <Modal open={notFound} onClose={() => setNotFound(false)}>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/15">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-amber-400">
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold text-red-300">No Project Found</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100/70">
            No project exists for this applicant yet. Create the project first to
            raise a valuation.
          </p>
          <Button
            type="button"
            fullWidth
            className="mt-5"
            onClick={() => navigate('/coordinator/new-project', { state: { nic: lastQ } })}
          >
            Create Project
          </Button>
        </div>
      </Modal>
    </Card>
  )
}

export default ProjectLookup
