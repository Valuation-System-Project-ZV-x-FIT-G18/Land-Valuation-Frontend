import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import FleetTable from '@/Role_Pages/coordinator/fleet-management/components/FleetTable'
import AssignOfficerForm from '@/Role_Pages/coordinator/fleet-management/components/AssignOfficerForm'
import { baseCols, officerCells } from '@/Role_Pages/coordinator/fleet-management/components/officerRows'
import {
  getFleetOfficers,
  getUnassigned,
  acceptRejection,
} from '@/Role_Pages/coordinator/fleet-management/api/fleet'
import type {
  FleetOfficers,
  Officer,
} from '@/Role_Pages/coordinator/fleet-management/types/fleet'

const emptyOfficers: FleetOfficers = { all: [], available: [], assigned: [], onLeave: [], rejected: [] }

const AssignOfficersPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  // A valuation handed over from the New Valuation "assign now" flow, if any —
  // we seed the search with its NIC (or Project ID) so it opens straight away.
  const incoming = location.state as { nic?: string; projectId?: string } | null
  const initialQuery = incoming?.nic || incoming?.projectId || undefined
  const [officers, setOfficers] = useState<FleetOfficers>(emptyOfficers)
  const [available, setAvailable] = useState<Officer[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const load = useCallback(async () => {
    const [o, u] = await Promise.all([getFleetOfficers(), getUnassigned()])
    setOfficers(o)
    setAvailable(u.officers)
    setError(o.error || u.error || '')
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const onAccept = async (rowId: number) => {
    const res = await acceptRejection(rowId)
    if (res.ok) {
      setNotice('Rejection accepted — the officer is available again.')
      load()
    } else setError(res.error ?? 'Could not accept the rejection.')
  }

  return (
    <div className="space-y-6">
      <SuccessModal
        open={!!notice}
        title="Assignment Updated"
        message={notice}
        closeLabel="Done"
        onClose={() => setNotice('')}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => navigate('/coordinator/fleet-management')}
        className="!px-5 !py-2.5 text-sm"
      >
        ← Fleet Management
      </Button>

      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Assign <GradientText>Technical Officers</GradientText>
        </h1>
      </div>

      {error && (
        <p className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-center text-sm text-red-200">
          {error}
        </p>
      )}
      {/* Assign action */}
      <AssignOfficerForm
        officers={available}
        initialQuery={initialQuery}
        onAssigned={() => {
          setNotice('Officer assigned and notified. Project status updated.')
          load()
        }}
      />

      {/* Categorized officer lists */}
      <FleetTable
        title="Available"
        icon="🟢"
        columns={baseCols}
        rows={officers.available.map((o) => officerCells(o))}
        emptyText="No officers are free right now."
      />
      <FleetTable
        title="Assigned"
        icon="🛠️"
        columns={[...baseCols, 'Project', 'Status']}
        rows={officers.assigned.map((o) => [...officerCells(o), o.projectId, o.status])}
        emptyText="No officers are currently assigned."
      />
      <FleetTable
        title="On Leave"
        icon="🌴"
        columns={[...baseCols, 'Reason']}
        rows={officers.onLeave.map((o) => [...officerCells(o), o.reason])}
        emptyText="No officers are on leave."
      />
      <FleetTable
        title="Rejected Assignments"
        icon="⛔"
        columns={[...baseCols, 'Reason', 'Action']}
        rows={officers.rejected.map((o) => [
          ...officerCells(o),
          o.reason,
          <button
            key="accept"
            type="button"
            onClick={() => onAccept(o.valuationRowId)}
            className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 transition hover:bg-emerald-500/20"
          >
            Accept → free officer
          </button>,
        ])}
        emptyText="No rejected assignments."
      />
    </div>
  )
}

export default AssignOfficersPage
