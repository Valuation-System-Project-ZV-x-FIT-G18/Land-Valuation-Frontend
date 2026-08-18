import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Input from '@/Common_Pages/components/ui/Input'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'
import LocationPicker from './LocationPicker'
import MiniMap from './MiniMap'
import NextStepModal from '@/Role_Pages/technical-officer/shared/NextStepModal'
import { getLocation, saveMap, type MapLocation } from '@/Role_Pages/technical-officer/mapping/api/mapping'

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <Card className="overflow-hidden">
    <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.025] px-5 py-4 sm:px-6">
      <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-gold-400/25 bg-gold-400/10 text-xs font-bold text-gold-200">{String(n).padStart(2, '0')}</span>
      <h3 className="text-sm font-bold tracking-wide text-white">{title}</h3>
    </div>
    <div className="p-5 sm:p-6">{children}</div>
  </Card>
)

const MapWorkspace = ({ projectId, onBack }: { projectId: string; onBack: () => void }) => {
  const [loc, setLoc] = useState<MapLocation | null>(null)
  // Working data is kept in sessionStorage (scoped per project) so a page
  // refresh mid-edit does NOT lose the picked location or generated text.
  const k = (name: string) => `gpsMap:${projectId}:${name}`
  const [lat, setLat] = useSessionState<number | null>(k('lat'), null)
  const [lng, setLng] = useSessionState<number | null>(k('lng'), null)
  const [latText, setLatText] = useSessionState(k('latText'), '')
  const [lngText, setLngText] = useSessionState(k('lngText'), '')
  const [access, setAccess] = useSessionState(k('access'), '')
  const [accessSources, setAccessSources] = useSessionState<string[]>(k('accessSrc'), [])
  const [locality, setLocality] = useSessionState(k('locality'), '')
  const [localitySources, setLocalitySources] = useSessionState<string[]>(k('localitySrc'), [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [goNext, setGoNext] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    getLocation(projectId).then((l) => {
      if (!l) return setError('Project not found.')
      setLoc(l)
      // Only hydrate from the database the FIRST time (no session yet) so we
      // never clobber unsaved edits kept across a refresh.
      const hasSessionPoint = lat !== null && lng !== null
      if (sessionStorage.getItem(k('hydrated')) === null || (!hasSessionPoint && l.latitude !== null && l.longitude !== null)) {
        setPoint(l.latitude, l.longitude)
        setAccess(l.accessDescription || '')
        setLocality(l.localityDescription || '')
        setAccessSources(l.accessSources || [])
        setLocalitySources(l.localitySources || [])
        sessionStorage.setItem(k('hydrated'), '1')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const has = lat !== null && lng !== null

  // Keep the numeric coordinates and their text mirrors in sync.
  const setPoint = (la: number | null, ln: number | null) => {
    setLat(la)
    setLng(ln)
    setLatText(la !== null ? String(la) : '')
    setLngText(ln !== null ? String(ln) : '')
  }

  // Typing a coordinate updates the marker live.
  const editLat = (v: string) => {
    setLatText(v)
    const n = parseFloat(v)
    if (!Number.isNaN(n)) setLat(n)
  }
  const editLng = (v: string) => {
    setLngText(v)
    const n = parseFloat(v)
    if (!Number.isNaN(n)) setLng(n)
  }
  const save = async () => {
    if (!has) return setError('Choose a location before saving.')
    setSaving(true); setError(''); setSaved(false)
    const res = await saveMap(projectId, lat as number, lng as number, access, locality, accessSources, localitySources)
    setSaving(false)
    if (res.ok) {
      setSaved(true)
      setGoNext(true)
      setNotice('✓ Saved. You can return to this page anytime to view or update it.')
    } else {
      setError(res.error ?? 'Could not save.')
    }
  }

  const gmaps = has ? `https://www.google.com/maps/@${lat},${lng},19z/data=!3m1!1e3` : '#'

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" size="sm" onClick={onBack}>← Assigned projects</Button>
        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${has ? 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200' : 'border-amber-300/25 bg-amber-300/10 text-amber-200'}`}>
          <span className={`h-2 w-2 rounded-full ${has ? 'bg-emerald-300' : 'bg-amber-300'}`} />
          {has ? 'Location selected' : 'Location required'}
        </span>
      </div>

      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300/70">Project {projectId}</p>
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">GPS &amp; <GradientText>Map</GradientText></h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-emerald-100/60">Select the exact property location and verify it using the satellite and road maps.</p>
      </div>

      <Card className="hidden">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-300/75">Geospatial workspace</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">GPS &amp; Map <GradientText>{projectId}</GradientText></h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-100/65">
              Pin the exact property location, verify the surrounding area, and prepare access and locality descriptions.
            </p>
          </div>
          <div className="grid min-w-0 gap-2 text-sm sm:grid-cols-2 lg:min-w-[420px]">
            <div className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/45">Property address</p>
              <p className="mt-1 truncate font-medium text-emerald-50">{loc?.address || 'Loading project details…'}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/15 px-4 py-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-100/45">Nearest city</p>
              <p className="mt-1 font-medium text-emerald-50">{loc?.nearestCity || '—'}{loc?.district ? ` · ${loc.district}` : ''}</p>
            </div>
          </div>
        </div>
        <div className="hidden">
          <div className={`rounded-lg px-3 py-2 ${has ? 'bg-emerald-400/10 text-emerald-200' : 'bg-gold-400/10 text-gold-200'}`}>1. Pin location</div>
          <div className={`rounded-lg px-3 py-2 ${has ? 'bg-gold-400/10 text-gold-200' : 'bg-white/5 text-emerald-100/35'}`}>2. Review maps</div>
          <div className={`rounded-lg px-3 py-2 ${access || locality ? 'bg-gold-400/10 text-gold-200' : 'bg-white/5 text-emerald-100/35'}`}>3. Prepare notes</div>
        </div>
      </Card>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_330px]">
        <Step n={1} title="Pin the property location">
          <p className="mb-4 text-sm leading-6 text-emerald-100/60">Search by address or landmark, then click the exact property position on the map.</p>
          <LocationPicker lat={lat} lng={lng} onPick={(la, ln) => setPoint(la, ln)} />
        </Step>

        <Step n={2} title="Confirm coordinates">
          <p className="mb-4 text-sm leading-6 text-emerald-100/60">Paste survey coordinates or fine-tune the selected point manually.</p>
          <div className="space-y-4">
          <Input
            label="Latitude"
            value={latText}
            onChange={(e) => editLat(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 6.845210"
            className="font-mono text-gold-200"
          />
            <Input
            label="Longitude"
            value={lngText}
            onChange={(e) => editLng(e.target.value)}
            inputMode="decimal"
            placeholder="e.g. 79.921380"
            className="font-mono text-gold-200"
          />
          </div>
          <div className="hidden">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-100/45">Coordinate status</p>
            <p className={`mt-1 text-sm font-semibold ${has ? 'text-emerald-200' : 'text-emerald-100/55'}`}>
              {has ? '✓ Ready for map review' : 'Waiting for a valid point'}
            </p>
            {has && <p className="mt-2 break-all font-mono text-xs text-emerald-100/55">{lat?.toFixed(7)}, {lng?.toFixed(7)}</p>}
          </div>
        </Step>
      </div>

      {has && (
        <>
          {/* 3. Satellite view (zoomed) */}
          <Step n={3} title="Review satellite imagery">
            <div className="grid gap-5 [&>div:nth-child(2)]:hidden">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-200/55">Property detail · Zoom 17</p>
                <MiniMap lat={lat as number} lng={lng as number} variant="satellite" zoom={17} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-200/55">Surrounding context · Zoom 16</p>
                <MiniMap lat={lat as number} lng={lng as number} variant="satellite" zoom={16} />
              </div>
            </div>
            <a href={gmaps} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-gold-300 transition hover:border-gold-400/30 hover:bg-gold-400/10 hover:text-gold-200">
              Open satellite view in Google Maps ↗
            </a>
          </Step>

          {/* 4. Map view */}
          <Step n={4} title="Verify road and map context">
            <MiniMap lat={lat as number} lng={lng as number} variant="map" zoom={17} />
          </Step>

        </>
      )}

      {saved && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center text-sm font-medium text-emerald-200">
          ✓ Saved. This location and the generated descriptions are stored — reopen
          this project’s GPS &amp; Map anytime to view or edit them.
        </div>
      )}
      {notice && !saved && <p className="text-center text-sm text-emerald-200">{notice}</p>}
      {error && <p className="text-center text-sm text-amber-300">{error}</p>}

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">Save this mapping workspace</p>
            <p className="mt-1 text-sm text-emerald-100/55">{has ? 'Coordinates are ready. Generated descriptions can be added or updated later.' : 'Select a valid property location before saving.'}</p>
          </div>
          <Button type="button" variant="success" loading={saving} disabled={!has} onClick={save} className="shrink-0 sm:min-w-64">
            {saving ? 'Saving…' : saved ? 'Update map details' : 'Save map details'}
          </Button>
        </div>
      </Card>

      <NextStepModal
        open={goNext}
        onClose={() => setGoNext(false)}
        nextLabel="Analyse Nearby Lands"
        nextTo="/technical-officer/nearby"
        projectId={projectId}
        message="Location and descriptions saved."
      />
    </div>
  )
}

export default MapWorkspace
