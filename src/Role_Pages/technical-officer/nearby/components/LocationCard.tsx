import Card from '@/Common_Pages/components/ui/Card'
import type { NearbyLocation } from '@/Role_Pages/technical-officer/nearby/api/nearby'

// Shows the subject's location (prefilled from Create Project) with GPS and a
// Google satellite map. Uses the classic embed (t=k = satellite) — no API key.
const LocationCard = ({ loc }: { loc: NearbyLocation }) => {
  const address = [loc.propertyNumber, loc.streetName, loc.villageTown].filter(Boolean).join(', ')
  const latitude = Number(loc.latitude)
  const longitude = Number(loc.longitude)
  const hasGps = loc.latitude != null && loc.longitude != null && Number.isFinite(latitude) && Number.isFinite(longitude)
  const mapSrc = hasGps ? `https://maps.google.com/maps?q=${latitude},${longitude}&t=k&z=17&output=embed` : ''
  const mapsLink = hasGps ? `https://www.google.com/maps/@${latitude},${longitude},18z/data=!3m1!1e3` : '#'

  const Row = ({ label, value }: { label: string; value: string }) => (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-emerald-200/60">{label}</p>
      <p className="text-sm font-medium text-white">{value || '—'}</p>
    </div>
  )

  return (
    <Card className="p-5 sm:p-6">
      <h3 className="mb-4 text-sm font-semibold text-gold-300">Subject Property Location</h3>
      <div className="grid gap-4 sm:grid-cols-3">
        <Row label="Address" value={address} />
        <Row label="District" value={loc.district} />
        <Row label="Province" value={loc.province} />
        <Row label="Property Type" value={loc.propertyType} />
        <Row label="Extent" value={loc.extentPerches ? `${loc.extentPerches} perches` : ''} />
        <Row label="GPS" value={hasGps ? `${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : 'Not set'} />
      </div>

      {hasGps ? (
        <div className="mt-4">
          <iframe title="Satellite view" src={mapSrc} className="h-72 w-full rounded-xl border border-white/15" loading="lazy" />
          <a href={mapsLink} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-gold-300 hover:text-gold-200">
            Open satellite view in Google Maps ↗
          </a>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-amber-300/30 bg-amber-300/10 p-3 text-xs text-amber-200">
          No GPS coordinates were set for this project in Create Project, so the map can't be shown.
        </p>
      )}
    </Card>
  )
}

export default LocationCard
