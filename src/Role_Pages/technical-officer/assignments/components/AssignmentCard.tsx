import Card from '@/Common_Pages/components/ui/Card'
import StatusBadge from '@/Role_Pages/coordinator/project-status/components/StatusBadge'
import Button from '@/Common_Pages/components/ui/Button'
import MiniMap from '@/Role_Pages/technical-officer/mapping/components/MiniMap'
import { useNavigate } from 'react-router-dom'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

// A small labeled definition list used within a card section.
const Detail = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-xs uppercase tracking-wide text-emerald-200/50">{label}</dt>
    <dd className="text-sm font-medium text-white">{value || '—'}</dd>
  </div>
)

const Section = ({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) => (
  <div className="mt-4 border-t border-white/10 pt-4">
    <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-100">
      <span>{icon}</span> {title}
    </h4>
    <dl className="grid gap-3 sm:grid-cols-2">{children}</dl>
  </div>
)

const AssignmentCard = ({ a }: { a: Assignment }) => {
  const navigate = useNavigate()
  const lat = Number(a.location.latitude)
  const lng = Number(a.location.longitude)
  const hasCoords = Number.isFinite(lat) && Number.isFinite(lng)
  const mapUrl = hasCoords ? `https://www.google.com/maps?q=${lat},${lng}` : ''

  return (
    <Card className="p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-gold-300">
            {a.projectId} · Valuation #{a.valuationId}
          </p>
          <p className="text-xs text-emerald-200/50">{a.project.propertyType || 'Property'}</p>
        </div>
        <StatusBadge status={a.status} />
      </div>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100/55">Valuation workflow</p>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <span className="font-medium text-gold-200">1. Assignment</span>
          <span className="text-emerald-100/35">→</span>
          <span className="font-medium text-gold-200">2. Inspection</span>
          <span className="text-emerald-100/35">→</span>
          <span className="text-emerald-100/65">3. Site photos</span>
          <span className="text-emerald-100/35">→</span>
          <span className="text-emerald-100/65">4. Map & analysis</span>
          <span className="text-emerald-100/35">→</span>
          <span className="text-emerald-100/65">5. Description</span>
          <span className="text-emerald-100/35">→</span>
          <span className="text-emerald-100/65">6. Draft</span>
        </div>
      </div>

      {/* Visit schedule */}
      <Section icon="📅" title="Site Visit">
        <Detail label="Date" value={a.date} />
        <Detail label="Time" value={a.time} />
      </Section>

      {/* Footer: short guide and CTA */}
      <div className="mt-6 border-t border-white/8 pt-4 flex items-center justify-between gap-4">
        <p className="text-sm text-emerald-200/60 max-w-md">
          <strong className="text-emerald-100">Next:</strong> Add inspection, then add site photos and create the draft.
          These help produce a complete report.
        </p>
        <div>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() =>
              navigate('/technical-officer/inspections', {
                state: { projectId: a.projectId, valuationId: a.valuationId },
              })
            }
            className="!px-4 !py-2 text-sm"
          >
            Add Inspection →
          </Button>
        </div>
      </div>

      {/* Location */}
      <Section icon="📍" title="Location">
        <div className="sm:col-span-2">
          <Detail label="Address" value={a.location.address} />
        </div>
        <Detail label="GN Division" value={a.location.gnDivision} />
        <Detail label="DS Division" value={a.location.dsDivision} />
        <Detail label="District" value={a.location.district} />
        <Detail label="Province" value={a.location.province} />
        {hasCoords && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-emerald-200/50">Coordinates</dt>
            <dd className="text-sm font-medium text-white">
              {lat.toFixed(5)}, {lng.toFixed(5)}{' '}
              <a href={mapUrl} target="_blank" rel="noreferrer" className="ml-1 text-gold-200 underline">
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
      <Section icon="👤" title="Owner / Applicant">
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

    </Card>
  )
}

export default AssignmentCard
