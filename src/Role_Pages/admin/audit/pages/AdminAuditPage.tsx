import { useEffect, useMemo, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Table from '@/Common_Pages/components/ui/Table'
import Badge from '@/Common_Pages/components/ui/Badge'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { inputClass } from '@/Role_Pages/admin/user-details/pages/userDetailsHelpers'
import { getAuditLogs, type AdminAuditLog } from '@/Role_Pages/admin/user-details/api/user-details'

// Every action the backend writes to admin_audit_logs needs an entry here.
// A missing one is not a crash, just an unreadable row: bank activity used to
// show up as raw BANK_BRANCH_DELETED next to the friendly user rows.
const LABELS: Record<string, string> = {
  USER_CREATED: 'User created',
  USER_UPDATED: 'User updated',
  USER_STATUS_CHANGED: 'Status changed',
  USER_PASSWORD_RESET: 'Password reset',
  BANK_CREATED: 'Bank created',
  BANK_DELETED: 'Bank deleted',
  BANK_BRANCH_CREATED: 'Branch created',
  BANK_BRANCH_DELETED: 'Branch deleted',
}

// Fall back to a readable form of any action added to the backend later.
const labelFor = (action: string) =>
  LABELS[action] ??
  action.toLowerCase().replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())

const AdminAuditPage = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  useEffect(() => {
    getAuditLogs().then((result) => {
      setLogs(result.logs); setError(result.error ?? ''); setLoading(false)
    })
  }, [])

  // Only actions actually present are offered, so the dropdown never lists a
  // filter that would return nothing.
  const actions = useMemo(
    () => Array.from(new Set(logs.map((log) => log.action))).sort(),
    [logs],
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return logs.filter((log) => {
      if (actionFilter && log.action !== actionFilter) return false
      if (!q) return true
      const details = Object.entries(log.details ?? {})
        .map(([key, value]) => `${key} ${String(value)}`)
        .join(' ')
      return [log.actorUserId, log.targetUserId, labelFor(log.action), log.action, details]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [logs, search, actionFilter])

  const rows = filtered.map((log) => [
    <span key="date" className="whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</span>,
    <Badge key="action" tone="info">{labelFor(log.action)}</Badge>,
    <span key="actor" className="font-medium text-white">{log.actorUserId ?? 'System'}</span>,
    <span key="target" className="text-accent-200">{log.targetUserId ?? '—'}</span>,
    <span key="details" className="text-xs text-emerald-100">
      {Object.entries(log.details ?? {}).map(([key, value]) => `${key}: ${String(value)}`).join(' · ') || '—'}
    </span>,
  ])

  return <div className="mx-auto max-w-7xl space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-white">Admin <GradientText>Audit Log</GradientText></h1>
      <p className="mt-2 text-emerald-100">A read-only history of administrator account and bank changes.</p>
    </div>
    {error && <p className="text-sm text-red-300">{error}</p>}
    <Card className="overflow-hidden p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-emerald-100">
          <span className="font-semibold text-white">{filtered.length}</span> of {logs.length} entries
        </p>
        <div className="grid w-full gap-2 sm:w-[36rem] sm:grid-cols-[minmax(0,1fr)_12rem]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by admin, user or detail"
            className={`${inputClass} min-w-0`}
          />
          <select
            value={actionFilter}
            onChange={(event) => setActionFilter(event.target.value)}
            className={inputClass}
          >
            <option value="" className="bg-surface">All actions</option>
            {actions.map((action) => (
              <option key={action} value={action} className="bg-surface">{labelFor(action)}</option>
            ))}
          </select>
        </div>
      </div>
      {loading ? <p className="text-sm text-emerald-100">Loading activity…</p> :
        <Table columns={['Date & time', 'Action', 'Performed by', 'User', 'Details']} rows={rows} emptyText={logs.length === 0 ? 'No admin activity recorded yet.' : 'No entries match that filter.'} minWidth={850} />}
    </Card>
  </div>
}

export default AdminAuditPage
