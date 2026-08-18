import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import Modal from '@/Common_Pages/components/ui/Modal'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import ValuationForm from '@/Role_Pages/coordinator/new-valuation/components/ValuationForm'
import type { ValuationResult } from '@/Role_Pages/coordinator/new-valuation/components/ValuationForm'
import WorkflowStepper from '@/Role_Pages/coordinator/shared/WorkflowStepper'

// Coordinator > New Valuation.
// Find an existing project (by NIC or Project ID) to unlock the form.
const NewValuationPage = () => {
  const navigate = useNavigate()
  const [done, setDone] = useState<ValuationResult | null>(null)

  return (
    <div className="space-y-8">
      <WorkflowStepper current="valuation" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          New <GradientText>Valuation</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Load an existing project, then enter the bank&apos;s valuation request.
        </p>
      </div>

      <ValuationForm onDone={(result) => setDone(result)} />

      <Modal open={!!done} onClose={() => navigate('/dashboard')}>
        {done && (
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">✓</div>
            <h3 className="mt-4 text-2xl"><GradientText>Valuation Created</GradientText></h3>
            <dl className="mx-auto mt-5 max-w-xs space-y-2 text-sm">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <dt className="text-emerald-200/60">Project ID</dt>
                <dd className="font-medium text-white">{done.projectId}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-emerald-200/60">Valuation No.</dt>
                <dd className="font-semibold text-gold-300">#{done.valuationId}</dd>
              </div>
            </dl>

            <p className="mt-6 font-medium text-white">Assign a Technical Officer now?</p>
            <div className="mt-3 flex gap-3">
              <Button
                type="button"
                fullWidth
                onClick={() =>
                  navigate('/coordinator/fleet-management/assign', { state: done })
                }
              >
                Yes, assign now
              </Button>
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setDone(null)}
              >
                No
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default NewValuationPage
