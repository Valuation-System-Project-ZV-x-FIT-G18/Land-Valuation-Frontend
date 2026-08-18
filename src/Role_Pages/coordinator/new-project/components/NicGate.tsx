import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import FormField from '@/Common_Pages/components/ui/FormField'
import Modal from '@/Common_Pages/components/ui/Modal'
import { validateNIC } from '@/Common_Pages/validation/validateNIC'
import { searchApplicantByNic } from '@/Role_Pages/coordinator/create-project/api/create-project'

// Top of the Create Project form: enter the land owner's NIC.
// If the NIC belongs to a registered applicant, the form below unlocks.
// If not, a popup prompts registration and redirects to the register page.
type NicGateProps = {
  onConfirmed: (nic: string, name: string) => void
}

const NicGate = ({ onConfirmed }: NicGateProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  // Pre-fill the NIC if we arrived here from New Valuation (no re-typing).
  const [nic, setNic] = useState((location.state as { nic?: string } | null)?.nic ?? '')
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const check = async () => {
    const err = validateNIC(nic)
    if (err) {
      setError(err)
      return
    }
    setError('')
    setChecking(true)
    const res = await searchApplicantByNic(nic)
    setChecking(false)
    if (res.found && res.applicant) {
      onConfirmed(res.applicant.nic, res.applicant.name)
    } else if (res.error) {
      setError(res.error)
    } else {
      setNotFound(true)
    }
  }

  // Arrived with a NIC already filled (from Register Bank / New Valuation) ->
  // verify it automatically so the form unlocks without an extra click.
  useEffect(() => {
    if (nic) check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="mb-1 text-lg font-bold text-white">Land Owner (NIC)</h2>
      <p className="mb-5 text-sm text-emerald-100/70">
        Enter the NIC of the registered loan applicant to begin.
      </p>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <FormField
            label="NIC Number"
            name="nicLookup"
            value={nic}
            onChange={(e) => {
              setNic(e.target.value)
              setError('')
            }}
            error={error}
            placeholder="e.g. 200012345678 or 951234567V"
          />
        </div>
        <Button type="button" onClick={check} disabled={checking} className="sm:mt-7">
          {checking ? 'Checking…' : 'Check'}
        </Button>
      </div>

      {/* Not-found popup: applicant must be registered first. */}
      <Modal open={notFound} onClose={() => setNotFound(false)}>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/15">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-amber-400">
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>
          <h3 className="mt-4 text-xl font-bold text-red-300">Applicant Not Registered</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100/70">
            This NIC isn&apos;t registered as a loan applicant. Register them
            first to create a project.
          </p>
          <Button
            type="button"
            fullWidth
            className="mt-5"
            onClick={() => {
              // Start a brand-new applicant: wipe any half-filled form so every
              // fresh registration opens empty (only the searched NIC carries in).
              sessionStorage.removeItem('registerApplicant:form')
              navigate('/coordinator/register-applicant', { state: { nic } })
            }}
          >
            + Register New Applicant
          </Button>
        </div>
      </Modal>
    </Card>
  )
}

export default NicGate
