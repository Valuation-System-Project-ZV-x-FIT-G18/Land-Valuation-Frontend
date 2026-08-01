import { useEffect, useState } from 'react'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import StatusBadge from '@/Role_Pages/coordinator/project-status/components/StatusBadge'
import StatusTimeline from '@/Role_Pages/coordinator/project-status/components/StatusTimeline'
import type { TimelineStep } from '@/Role_Pages/coordinator/project-status/components/StatusTimeline'
import { formatDate, getTimeline } from '@/Role_Pages/coordinator/project-status/api/project-status'
import type { StatusDetail as StatusDetailType } from '@/Role_Pages/coordinator/project-status/types/project-status'

// Level 3: the status of a chosen valuation and its parent project.
type StatusDetailProps = {
  status: StatusDetailType
  onBack: () => void
}

const StatusDetail = ({ status, onBack }: StatusDetailProps) => {
  // The full project lifecycle, computed on the server from the actual data.
  const [steps, setSteps] = useState<TimelineStep[]>([])
  useEffect(() => {
    getTimeline(status.rowId).then(setSteps)
  }, [status.rowId])

  const rows: [string, string][] = [
    ['Project ID', status.projectId],
    ['Valuation No.', `#${status.valuationId}`],
    ['Applicant NIC', status.nic],
    ['Property Type', status.propertyType || '—'],
    ['Created', formatDate(status.createdAt)],
  ]

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">
        ← Back to valuations
      </Button>

      <Card className="p-6 sm:p-8">
        <h3 className="text-center text-2xl">
          <GradientText>Project Status</GradientText>
        </h3>

        {/* The two headline statuses */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-emerald-200/50">Project</p>
            <div className="mt-2">
              <StatusBadge status={status.projectStatus} />
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-emerald-200/50">Valuation</p>
            <div className="mt-2">
              <StatusBadge status={status.valuationStatus} />
            </div>
          </div>
        </div>

        {/* The reference details */}
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs uppercase tracking-wide text-emerald-200/50">{k}</dt>
              <dd className="text-sm font-medium text-white">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* Lifecycle progress checklist */}
      <Card className="p-6 sm:p-8">
        <h4 className="mb-6 text-sm font-semibold uppercase tracking-wide text-emerald-200/50">
          Progress
        </h4>
        <StatusTimeline steps={steps} />
      </Card>
    </div>
  )
}

export default StatusDetail
