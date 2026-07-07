import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import Modal from '@/Common_Pages/components/ui/Modal'
import SelectField from '@/Common_Pages/components/ui/SelectField'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import {
  listTechnicalOfficers,
  assignTechnicalOfficer,
} from '@/Role_Pages/coordinator/assign-technical-officer/api/assign-technical-officer'
import type {
  TechnicalOfficer,
  AssignContext,
} from '@/Role_Pages/coordinator/assign-technical-officer/types/assign-technical-officer'

// Coordinator > Assign Technical Officer.
// Reached from the New Valuation success popup ("Yes, assign now"), which passes
// the valuation in navigation state. Assigning updates the project + valuation
// status and notifies the loan applicant and the requesting bank.
const AssignTechnicalOfficerPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const ctx = location.state as AssignContext | null

  const [officers, setOfficers] = useState<TechnicalOfficer[]>([])
  const [selected, setSelected] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    listTechnicalOfficers().then((res) => {
      setOfficers(res.officers)
      if (res.error) setError(res.error)
      setLoading(false)
    })
  }, [])

  // Opened directly without a valuation to assign.
  if (!ctx?.rowId) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <p className="font-semibold text-gold-200">No valuation selected</p>
        <p className="mt-1 text-sm text-emerald-100/70">
          Open this page from a created valuation to assign a technical officer.
        </p>
        <Button type="button" className="mt-5" onClick={() => navigate('/coordinator/new-valuation')}>
          Go to New Valuation
        </Button>
      </Card>
    )
  }

  const handleAssign = async () => {
    if (!selected) {
      setError('Please select a technical officer.')
      return
    }
    setError('')
    setSubmitting(true)
    const res = await assignTechnicalOfficer(ctx.rowId, selected)
    setSubmitting(false)
    if (res.ok) setDone(true)
    else setError(res.error ?? 'Could not assign the officer.')
  }

  const options = [
    { value: '', label: loading ? 'Loading officers…' : 'Select a technical officer' },
    ...officers.map((o) => ({ value: o.userId, label: `${o.name} (${o.userId})` })),
  ]

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Assign <GradientText>Technical Officer</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Choose the officer who will inspect and value this land.
        </p>
      </div>

      {/* Valuation context */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-5 text-sm">
        <span className="font-medium text-emerald-100">
          Project <span className="text-gold-300">{ctx.projectId}</span>
          <span className="text-emerald-200/60"> · Valuation #{ctx.valuationId}</span>
        </span>
        <span className="text-emerald-200/60">NIC {ctx.nic}</span>
      </Card>

      <Card className="p-6 sm:p-8">
        <SelectField
          label="Technical Officer"
          name="technicalOfficer"
          value={selected}
          onChange={(e) => {
            setSelected(e.target.value)
            setError('')
          }}
          options={options}
        />

        {officers.length === 0 && !loading && (
          <p className="mt-2 text-xs text-amber-300">
            No technical officers found in the system.
          </p>
        )}
        {error && <p className="mt-3 text-sm text-red-300">{error}</p>}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button type="button" fullWidth disabled={submitting} onClick={handleAssign}>
            {submitting ? 'Assigning…' : 'Assign Officer'}
          </Button>
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={() => navigate('/coordinator/new-valuation')}
          >
            Cancel
          </Button>
        </div>
      </Card>

      {/* Success popup */}
      <Modal open={done} onClose={() => navigate('/coordinator/project-states')}>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">
            ✓
          </div>
          <h3 className="mt-4 text-2xl">
            <GradientText>Technical Officer Assigned</GradientText>
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100/70">
            The loan applicant and the bank have been notified. The project status
            is now “Technical Officer Assigned”.
          </p>
          <Button
            type="button"
            fullWidth
            className="mt-5"
            onClick={() => navigate('/coordinator/project-states')}
          >
            View Project Status
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default AssignTechnicalOfficerPage
