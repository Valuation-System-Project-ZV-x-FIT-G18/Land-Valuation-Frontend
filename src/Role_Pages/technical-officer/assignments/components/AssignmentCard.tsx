import Card from '@/Common_Pages/components/ui/Card'
import StepFooter from '@/Role_Pages/technical-officer/shared/StepFooter'
import StatusBadge from '@/Role_Pages/coordinator/project-status/components/StatusBadge'
import MiniMap from '@/Role_Pages/technical-officer/mapping/components/MiniMap'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import { formatVisitDate, formatVisitTime } from '@/Common_Pages/lib/formatSiteVisit'

// A small labeled definition list used within a card section.
const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs uppercase tracking-wide text-emerald-200">{label}</dt>
    <dd className="text-sm font-medium text-white">{value || '—'}</dd>
  </div>
)

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mt-4 border-t border-white/10 pt-4">
    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-100">
      {title}
    </h4>
    <dl className="grid gap-3 sm:grid-cols-2">{children}</dl>
  </div>
)

const AssignmentCard = ({ a }: { a: Assignment }) => {
  const lat = Number(a.location.latitude)
  const lng = Number(a.location.longitude)
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
  const mapUrl = hasCoords ? `https://www.google.com/maps?q=${lat},${lng}` : ''

  // Work only opens up once the assignment has been accepted.
  const pendingAcceptance = a.status === 'Technical Officer Assigned'

  return (
    <Card className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-accent-300">
            {a.projectId} · Valuation #{a.valuationId}
          </p>
          <p className="text-xs text-emerald-200">{a.project.propertyType || 'Property'}</p>
        </div>
        <StatusBadge status={a.status} />
      </div>

      {/* Visit schedule */}
      <Section title="Site Visit">
        <Detail label="Date" value={a.date ? formatVisitDate(a.date) : ''} />
        <Detail label="Time" value={a.time ? formatVisitTime(a.time) : ''} />
      </Section>

      {pendingAcceptance && (
        <div className="mt-6 border-t border-white/8 pt-4">
          <p className="text-sm text-emerald-200">
            Accept this assignment to start the inspection.
          </p>
        </div>
      )}

      {/* Location */}
      <Section title="Location">
        <div className="sm:col-span-2">
          <Detail label="Address" value={a.location.address} />
        </div>
        <Detail label="GN Division" value={a.location.gnDivision} />
        <Detail label="DS Division" value={a.location.dsDivision} />
        <Detail label="District" value={a.location.district} />
        <Detail label="Province" value={a.location.province} />
        {hasCoords && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-emerald-200">Coordinates</dt>
            <dd className="text-sm font-medium text-white">
              {lat.toFixed(5)}, {lng.toFixed(5)}{' '}
              <a href={mapUrl} target="_blank" rel="noreferrer" className="ml-1 text-accent-200 underline">
                Open in Maps ↗
              </a>
            </dd>
          </div>
        )}
        {hasCoords && (
          <div className="sm:col-span-2">
            <MiniMap lat={lat} lng={lng} variant="satellite" zoom={18} />
          </div>
        )}
      </Section>

      {/* Owner */}
      <Section title="Owner / Applicant">
        <Detail label="Name" value={a.owner.name} />
        <Detail label="NIC" value={a.owner.nic} />
        <Detail label="Phone" value={a.owner.phone} />
        <Detail label="Email" value={a.owner.email} />
        <div className="sm:col-span-2">
          <Detail label="Owner (as per deed)" value={a.owner.nameAsPerDeed} />
        </div>
        <div className="sm:col-span-2">
          <Detail label="Address" value={a.owner.address} />
        </div>
      </Section>

      {/* The step's action bar closes the card, the same as every other step,
          rather than sitting halfway down between two detail sections. */}
      {!pendingAcceptance && (
        <StepFooter
          current="assigned"
          nextState={{ projectId: a.projectId, valuationId: a.valuationId }}
        >
          <p className="max-w-md text-sm text-emerald-200">
            Add inspection, then site photos and the draft. These build a complete report.
          </p>
        </StepFooter>
      )}
    </Card>
  )
}

export default AssignmentCard
