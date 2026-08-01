import { useCallback, useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Badge from '@/Common_Pages/components/ui/Badge'
import Table from '@/Common_Pages/components/ui/Table'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import ManagerReportView from '@/Role_Pages/manager/drafts/components/ManagerReportView'
import SearchBox from '@/Role_Pages/manager/drafts/components/SearchBox'
import {
  getAllProjects, filterProjects, STATUS_LABEL, STATUS_TONE, type ManagerProject,
} from '@/Role_Pages/manager/drafts/api/manager-drafts'

const COPY = {
  approved: {
    heading: <>Approved <GradientText>Drafts</GradientText></>,
    description: 'Drafts you have approved and passed further up the review chain.',
    countLabel: 'approved draft',
    emptyText: 'No approved drafts yet.',
  },
  rejected: {
    heading: <>Rejected <GradientText>Drafts</GradientText></>,
    description: 'Drafts you have rejected and sent back down the review chain.',
    countLabel: 'rejected draft',
    emptyText: 'No rejected drafts yet.',
  },
}

type Row = { project: ManagerProject; valuationId: number; status: string; technicalOfficerId: string }

const LEVEL: Record<string, 'L1' | 'L2' | 'L3'> = { 'Manager L1': 'L1', 'Manager L2': 'L2', 'Manager L3': 'L3' }

// Manager L1 / L2 / L3 > Approved Drafts / Rejected Drafts.
// Every draft this level has approved (passed up) or rejected (sent back down).
const ApprovedDraftsPage = ({ view = 'approved' }: { view?: 'approved' | 'rejected' }) => {
  const { user } = useAuth()
  const level = LEVEL[user?.role ?? ''] ?? 'L3'
  const copy = COPY[view]

  const [projects, setProjects] = useState<ManagerProject[]>([])
  const [loading, setLoading] = useState(true)
  const [viewing, setViewing] = useState<Row | null>(null)
  const [q, setQ] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    getAllProjects(level, view).then((p) => { setProjects(p); setLoading(false) })
  }, [level, view])

  useEffect(() => { load() }, [load])

  if (user && !LEVEL[user.role]) {
    return (
      <Card className="mx-auto max-w-lg p-8 text-center">
        <p className="font-semibold text-gold-200">Not available</p>
        <p className="mt-1 text-sm text-emerald-100/70">This page is only for managers.</p>
      </Card>
    )
  }

  if (viewing) {
    return (
      <ManagerReportView
        projectId={viewing.project.projectId}
        valuationId={viewing.valuationId}
        level="VIEW"
        reviewStatus={viewing.status}
        rejectReason={viewing.project.rejectReason}
        onBack={() => setViewing(null)}
        onDone={() => setViewing(null)}
      />
    )
  }

  const filtered = filterProjects(projects, q)
  const rows: Row[] = filtered.flatMap((p) => p.valuations.map((v) => ({
    project: p, valuationId: v.valuationId, status: v.status, technicalOfficerId: v.technicalOfficerId,
  })))

  const tableRows = rows.map((r) => [
    <span key="id" className="font-medium text-white">{r.project.projectId}</span>,
    r.project.ownerName || '—',
    r.project.location || '—',
    `#${r.valuationId}`,
    <Badge key="status" tone={STATUS_TONE[r.project.reviewStatus] ?? 'neutral'}>
      {STATUS_LABEL[r.project.reviewStatus] ?? r.project.reviewStatus}
    </Badge>,
    <Button key="view" type="button" size="sm" variant="outline" onClick={() => setViewing(r)}>View Draft</Button>,
  ])

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">{copy.heading}</h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">{copy.description}</p>
      </div>

      <SearchBox value={q} onChange={setQ} />

      <Card className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-amber-200 via-gold-300 to-amber-400" />
        <div className="p-6 sm:p-8">
          <p className="mb-4 text-sm text-emerald-100/70">
            <span className="font-semibold text-white">{rows.length}</span> {copy.countLabel}{rows.length === 1 ? '' : 's'}
          </p>
          {loading ? (
            <p className="text-center text-sm text-emerald-200/60">Loading…</p>
          ) : (
            <Table
              columns={['Project ID', 'Owner', 'Location', 'Valuation', 'Status', 'Action']}
              rows={tableRows}
              emptyText={copy.emptyText}
              minWidth={760}
            />
          )}
        </div>
      </Card>
    </div>
  )
}

export default ApprovedDraftsPage
