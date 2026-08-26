import { useEffect, useMemo, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import FleetTable from '@/Role_Pages/coordinator/fleet-management/components/FleetTable'
import { baseCols, officerCells } from '@/Role_Pages/coordinator/fleet-management/components/officerRows'
import { getFleetOfficers } from '@/Role_Pages/coordinator/fleet-management/api/fleet'
import type {
  AssignedOfficer,
  FleetOfficers,
} from '@/Role_Pages/coordinator/fleet-management/types/fleet'

const emptyOfficers: FleetOfficers = { all: [], available: [], assigned: [], onLeave: [], rejected: [] }

// Today's date in Sri Lanka time as yyyy-mm-dd, matching how the backend
// stores assigned_date.
const todayIso = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Colombo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())

const longToday = () =>
  new Intl.DateTimeFormat(undefined, {
    timeZone: 'Asia/Colombo',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

// What one officer's day looks like. The roster needs this per officer so a
// coordinator can answer "is this person usable today, and where are they?"
// from a single row, instead of cross-reading three separate tables.
type OfficerDay = {
  today: AssignedOfficer[]
  later: AssignedOfficer[]
  leaveReason?: string
}

const buildDayIndex = (officers: FleetOfficers, today: string) => {
  const index = new Map<string, OfficerDay>()
  const entryFor = (userId: string) => {
    const existing = index.get(userId)
    if (existing) return existing
    const created: OfficerDay = { today: [], later: [] }
    index.set(userId, created)
    return created
  }

  officers.assigned.forEach((a) => {
    const entry = entryFor(a.userId)
    if (a.assignedDate === today) entry.today.push(a)
    else entry.later.push(a)
  })
  officers.onLeave.forEach((o) => {
    entryFor(o.userId).leaveReason = o.reason || 'On leave'
  })
  return index
}

// A one-glance answer to "can I give this officer work today?", colour-coded so
// the roster can be scanned rather than read.
const DayBadge = ({ day }: { day?: OfficerDay }) => {
  const onLeave = Boolean(day?.leaveReason)
  const working = (day?.today.length ?? 0) > 0
  const tone = onLeave
    ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
    : working
      ? 'border-accent-400/40 bg-accent-400/10 text-accent-200'
      : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200'
  const label = onLeave ? 'On leave' : working ? `Working (${day?.today.length})` : 'Available'
  return (
    <span
      className={`whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tone}`}
      title={onLeave ? day?.leaveReason : undefined}
    >
      {label}
    </span>
  )
}

// An officer can hold more than one site visit in a day; collapsing them to a
// single line would hide a double booking, so each job keeps its own line.
const StackedCell = ({ lines }: { lines: string[] }) =>
  lines.length === 0 ? (
    <span className="text-emerald-300/60">—</span>
  ) : (
    <div className="space-y-0.5">
      {lines.map((line, i) => (
        <div key={i} className="whitespace-nowrap">
          {line}
        </div>
      ))}
    </div>
  )

type Stat = { label: string; value: number; tone: string }

const StatRow = ({ stats }: { stats: Stat[] }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    {stats.map((s) => (
      <Card key={s.label} className="p-6 text-center">
        <div className={`text-4xl font-bold ${s.tone}`}>{s.value}</div>
        <div className="mt-1 text-sm text-emerald-100">{s.label}</div>
      </Card>
    ))}
  </div>
)

const SectionHeading = ({ title, note }: { title: string; note: string }) => (
  <div className="border-b border-white/10 pb-3">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    <p className="mt-1 text-sm text-emerald-100">{note}</p>
  </div>
)

// Coordinator > Fleet Management > View Summary.
// Two clearly separated views of the same fleet:
//   1. Today  — who is working, free or on leave *today*. This is what a
//      coordinator actually needs each morning.
//   2. Overall — fleet-wide totals and open work that is not tied to one day.
// Mixing the two (e.g. "all officers" beside "on leave today") made the numbers
// read as if they belonged to the same day, which they never did.
const FleetSummaryPage = () => {
  const [officers, setOfficers] = useState<FleetOfficers>(emptyOfficers)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFleetOfficers().then((o) => {
      setOfficers(o)
      setLoading(false)
    })
  }, [])

  const today = todayIso()
  const assignedToday = useMemo(
    () => officers.assigned.filter((o) => o.assignedDate === today),
    [officers.assigned, today],
  )
  const assignedLater = useMemo(
    () => officers.assigned.filter((o) => o.assignedDate !== today),
    [officers.assigned, today],
  )

  const todayStats: Stat[] = [
    { label: 'Working today', value: assignedToday.length, tone: 'text-accent-300' },
    { label: 'Available today', value: officers.available.length, tone: 'text-emerald-300' },
    { label: 'On leave today', value: officers.onLeave.length, tone: 'text-amber-300' },
  ]

  const overallStats: Stat[] = [
    { label: 'All officers', value: officers.all.length, tone: 'text-white' },
    { label: 'Open assignments', value: officers.assigned.length, tone: 'text-accent-300' },
    { label: 'Scheduled for later', value: assignedLater.length, tone: 'text-emerald-200' },
    { label: 'Rejected (needs review)', value: officers.rejected.length, tone: 'text-red-300' },
  ]

  // Officer columns plus when the site visit is booked.
  const scheduleCols = [...baseCols, 'Project', 'Property location', 'Date', 'Time', 'Status']
  const scheduleRow = (o: (typeof officers.assigned)[number]) => [
    ...officerCells(o),
    o.projectId,
    o.propertyLocation || '—',
    o.assignedDate || '—',
    o.assignedTime || '—',
    o.status,
  ]

  return (
    <div className="space-y-6">
      {loading ? (
        <p className="text-center text-sm text-emerald-200">Loading summary…</p>
      ) : (
        <>
          {/* ---- Today ---- */}
          <section className="space-y-4">
            <SectionHeading title="Today" note={longToday()} />
            <StatRow stats={todayStats} />

            <FleetTable
              title="Working today"
              subtitle="Officers with a site visit booked for today."
              columns={scheduleCols}
              rows={assignedToday.map(scheduleRow)}
              emptyText="No site visits are booked for today."
            />
            <FleetTable
              title="Available today"
              subtitle="Not on leave and not tied to open work."
              columns={baseCols}
              rows={officers.available.map((o) => officerCells(o))}
              emptyText="No officers are free today."
            />
            <FleetTable
              title="On leave today"
              columns={[...baseCols, 'Reason']}
              rows={officers.onLeave.map((o) => [...officerCells(o), o.reason])}
              emptyText="No officers are on leave today."
            />
          </section>

          {/* ---- Overall ---- */}
          <section className="space-y-4 pt-4">
            <SectionHeading
              title="Overall"
              note="Fleet-wide totals and open work — not limited to today."
            />
            <StatRow stats={overallStats} />

            <FleetTable
              title="All technical officers"
              columns={baseCols}
              rows={officers.all.map((o) => officerCells(o))}
              emptyText="No technical officers in the system."
            />
            <FleetTable
              title="Scheduled for later"
              subtitle="Assignments accepted but booked for another day."
              columns={scheduleCols}
              rows={assignedLater.map(scheduleRow)}
              emptyText="Nothing is scheduled beyond today."
            />
            <FleetTable
              title="Rejected assignments"
              subtitle="Waiting for a coordinator to accept and reassign."
              columns={[...baseCols, 'Project', 'Reason']}
              rows={officers.rejected.map((o) => [...officerCells(o), o.projectId, o.reason])}
              emptyText="No rejected assignments."
            />
          </section>
        </>
      )}
    </div>
  )
}

export default FleetSummaryPage
