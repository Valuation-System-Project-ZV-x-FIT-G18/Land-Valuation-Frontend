import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Input from '@/Common_Pages/components/ui/Input'
import Table from '@/Common_Pages/components/ui/Table'
import { listAllValuations } from '@/Role_Pages/coordinator/valuations/api/valuations'
import { formatDate } from '@/Role_Pages/coordinator/project-status/api/project-status'
import { formatVisitDate, formatVisitTime } from '@/Common_Pages/lib/formatSiteVisit'
import type { ValuationListRow } from '@/Role_Pages/coordinator/valuations/types/valuations'

// Coordinator > Valuations.
// A valuation is the unit of work the whole system revolves around, so it gets
// its own destination instead of only being reachable by first finding the
// project it hangs off. The list answers "what work exists, and where has it
// got to?" in one screen; the row actions lead to the next step for that row.

const Stat = ({ label, value, tone }: { label: string; value: number; tone: string }) => (
  <Card className="p-5 text-center">
    <div className={`text-3xl font-bold ${tone}`}>{value}</div>
    <div className="mt-1 text-xs text-emerald-100">{label}</div>
  </Card>
)

const StatusPill = ({ status }: { status: string }) => (
  <span className="whitespace-nowrap rounded-full border border-emerald-200/20 bg-emerald-300/10 px-2.5 py-0.5 text-xs font-medium text-emerald-100">
    {status || 'Created'}
  </span>
)

const ValuationsPage = () => {
  const navigate = useNavigate()
  const [rows, setRows] = useState<ValuationListRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    listAllValuations().then((res) => {
      setRows(res.valuations)
      if (res.error) setError(res.error)
      setLoading(false)
    })
  }, [])

  // One filter box over every column a coordinator would search by — a project
  // id, an applicant's NIC or name, the bank, or the assigned officer.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      [
        r.projectId,
        r.nic,
        r.ownerName,
        r.bankName,
        r.branchName,
        r.status,
        r.technicalOfficerId,
        r.technicalOfficerName,
        `#${r.valuationId}`,
      ]
        .join(' ')
        .toLowerCase()
        .includes(q),
    )
  }, [rows, query])

  const unassigned = rows.filter((r) => !r.technicalOfficerId).length
  const scheduled = rows.filter((r) => r.inspectionDate).length

  const columns = [
    'Valuation',
    'Project',
    'Applicant',
    'Bank',
    'Technical officer',
    'Inspection',
    'Status',
    '',
  ]

  const toCells = (r: ValuationListRow) => [
    <span className="font-semibold text-accent-300">#{r.valuationId}</span>,
    <span className="font-medium text-white">{r.projectId}</span>,
    <span>
      <span className="block text-emerald-50">{r.ownerName || '—'}</span>
      <span className="block text-xs text-emerald-100/60">NIC {r.nic || '—'}</span>
    </span>,
    <span>
      <span className="block text-emerald-50">{r.bankName || '—'}</span>
      <span className="block text-xs text-emerald-100/60">{r.branchName || ''}</span>
    </span>,
    r.technicalOfficerId ? (
      <span>
        <span className="block text-emerald-50">{r.technicalOfficerName || r.technicalOfficerId}</span>
        <span className="block text-xs text-emerald-100/60">{r.technicalOfficerId}</span>
      </span>
    ) : (
      <span className="text-amber-200">Not assigned</span>
    ),
    r.inspectionDate ? (
      <span className="whitespace-nowrap">
        {formatVisitDate(r.inspectionDate)}
        {r.inspectionTime ? ` · ${formatVisitTime(r.inspectionTime)}` : ''}
      </span>
    ) : (
      <span className="text-emerald-300/60">—</span>
    ),
    <StatusPill status={r.status} />,
    <div className="flex justify-end gap-2">
      {!r.technicalOfficerId && (
        <Button
          type="button"
          className="!px-3 !py-1.5 text-xs"
          onClick={() =>
            navigate('/coordinator/fleet-management/assign', {
              state: { projectId: r.projectId, nic: r.nic },
            })
          }
        >
          Assign
        </Button>
      )}
      <Button
        type="button"
        variant="outline"
        className="!px-3 !py-1.5 text-xs"
        onClick={() => navigate('/coordinator/projects', { state: { query: r.projectId } })}
      >
        Open project
      </Button>
    </div>,
  ]

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            <GradientText>Valuations</GradientText>
          </h1>
          <p className="mt-2 max-w-xl text-emerald-100">
            Every valuation request raised against a project, and how far each one has got.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => navigate('/coordinator/valuations/new')}
          className="!px-5 !py-2.5 text-sm"
        >
          + New Valuation
        </Button>
      </div>

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-center text-sm text-red-200">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-center text-sm text-emerald-200">Loading valuations…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Total valuations" value={rows.length} tone="text-white" />
            <Stat label="Awaiting an officer" value={unassigned} tone="text-amber-300" />
            <Stat label="Inspection scheduled" value={scheduled} tone="text-accent-300" />
          </div>

          <Input
            aria-label="Filter valuations"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by project, NIC, applicant, bank or officer…"
          />

          <Card className="p-4 sm:p-6">
            <p className="mb-3 text-xs uppercase tracking-wide text-emerald-200">
              {filtered.length} of {rows.length} valuation{rows.length === 1 ? '' : 's'}
              {rows.length > 0 && filtered.length > 0
                ? ` · newest first (latest ${formatDate(filtered[0].createdAt)})`
                : ''}
            </p>
            <Table
              columns={columns}
              rows={filtered.map(toCells)}
              minWidth={1000}
              emptyText={
                rows.length === 0
                  ? 'No valuations have been created yet.'
                  : 'No valuation matches that filter.'
              }
            />
          </Card>
        </>
      )}
    </div>
  )
}

export default ValuationsPage
