import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import FleetTable from '@/Role_Pages/coordinator/fleet-management/components/FleetTable'
import { baseCols, officerCells } from '@/Role_Pages/coordinator/fleet-management/components/officerRows'
import { getFleetOfficers } from '@/Role_Pages/coordinator/fleet-management/api/fleet'
import type { FleetOfficers } from '@/Role_Pages/coordinator/fleet-management/types/fleet'

const emptyOfficers: FleetOfficers = { all: [], available: [], assigned: [], onLeave: [], rejected: [] }

// Coordinator > Fleet Management > View Summary.
// Read-only overview: counts plus the detailed officer lists per category.
// (No assign / accept actions here — this page is view-only.)
const FleetSummaryPage = () => {
  const navigate = useNavigate()
  const [officers, setOfficers] = useState<FleetOfficers>(emptyOfficers)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFleetOfficers().then((o) => {
      setOfficers(o)
      setLoading(false)
    })
  }, [])

  const stats = [
    { label: 'All Officers', value: officers.all.length, icon: '👷', tone: 'text-white' },
    { label: 'Available', value: officers.available.length, icon: '🟢', tone: 'text-emerald-300' },
    { label: 'Assigned', value: officers.assigned.length, icon: '🛠️', tone: 'text-gold-300' },
    { label: 'On Leave', value: officers.onLeave.length, icon: '🌴', tone: 'text-amber-300' },
    { label: 'Rejected', value: officers.rejected.length, icon: '⛔', tone: 'text-red-300' },
  ]

  return (
    <div className="space-y-6">
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
          Fleet <GradientText>Summary</GradientText>
        </h1>
      </div>

      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading summary…</p>
      ) : (
        <>
          {/* Quick counts */}
          <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <Card key={s.label} className="p-6 text-center">
                <div className="text-3xl">{s.icon}</div>
                <div className={`mt-2 text-4xl font-bold ${s.tone}`}>{s.value}</div>
                <div className="mt-1 text-sm text-emerald-100/70">{s.label}</div>
              </Card>
            ))}
          </div>

          {/* Detailed lists (view-only) */}
          <FleetTable
            title="All Technical Officers"
            icon="👷"
            columns={baseCols}
            rows={officers.all.map((o) => officerCells(o))}
            emptyText="No technical officers in the system."
          />
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
            columns={[...baseCols, 'Project']}
            rows={officers.assigned.map((o) => [...officerCells(o), o.projectId])}
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
            columns={[...baseCols, 'Project', 'Reason']}
            rows={officers.rejected.map((o) => [...officerCells(o), o.projectId, o.reason])}
            emptyText="No rejected assignments."
          />
        </>
      )}
    </div>
  )
}

export default FleetSummaryPage
