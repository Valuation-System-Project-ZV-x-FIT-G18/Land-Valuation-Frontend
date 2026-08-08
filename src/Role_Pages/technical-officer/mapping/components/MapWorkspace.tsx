import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Input from '@/Common_Pages/components/ui/Input'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'
import LocationPicker from './LocationPicker'
import MiniMap from './MiniMap'
import NextStepModal from '@/Role_Pages/technical-officer/shared/NextStepModal'
import { getLocation, generateAccess, generateLocality, saveMap, type MapLocation } from '@/Role_Pages/technical-officer/mapping/api/mapping'

// Editable "sources used" list shown under a generated description. The officer
// can correct, remove or add source lines; they are saved with the description.
const SourcesEditor = ({
  items,
  onChange,
}: {
  items: string[]
  onChange: (next: string[]) => void
}) => {
  const edit = (i: number, v: string) => onChange(items.map((s, idx) => (idx === i ? v : s)))
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i))
  const add = () => onChange([...items, ''])

  return (
    <details open={items.length > 0} className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <summary className="cursor-pointer text-xs font-semibold text-emerald-200/70">
        Sources used ({items.length}) — editable
      </summary>
      <div className="mt-2 space-y-2">
        {items.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                sizeVariant="sm"
                aria-label={`Source ${i + 1}`}
                value={s}
                onChange={(e) => edit(i, e.target.value)}
              />
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              aria-label="Remove source"
              className="rounded-lg border border-white/15 px-2 py-1 text-xs text-emerald-200/70 transition hover:border-red-400/50 hover:text-red-300"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={add}
          className="text-xs font-medium text-gold-300 transition hover:text-gold-200"
        >
          + Add source
        </button>
      </div>
    </details>
  )
}

const Step = ({ n, title, children }: { n: number; title: string; children: React.ReactNode }) => (
  <Card className="p-5 sm:p-6">
    <h3 className="mb-3 text-sm font-semibold text-gold-300">
      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gold-400/20 text-xs">{n}</span>
      {title}
    </h3>
    {children}
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
  const [flyTo, setFlyTo] = useState<{ lat: number; lng: number; zoom: number; nonce: number } | null>(null)
  const [busy, setBusy] = useState(false)
  const [busyLoc, setBusyLoc] = useState(false)
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

  // Typing a coordinate updates the marker live; blurring recenters the map.
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
  const recenter = () => {
    if (lat !== null && lng !== null) {
      setFlyTo({ lat, lng, zoom: 17, nonce: Date.now() })
    }
  }

  const generate = async () => {
    if (!has) return setError('Please choose the property location on the map first.')
    setBusy(true); setError(''); setNotice('')
    const res = await generateAccess(projectId, lat as number, lng as number)
    setBusy(false)
    setAccess(res.text)
    setAccessSources(res.sources)
    setNotice(res.aiUsed ? '✨ Access description generated with AI. Review, edit, then save.' : 'Access description drafted from form data.')
  }

  const generateLocalityDesc = async () => {
    if (!has) return setError('Please choose the property location on the map first.')
    setBusyLoc(true); setError(''); setNotice('')
    const res = await generateLocality(projectId, lat as number, lng as number)
    setBusyLoc(false)
    setLocality(res.text)
    setLocalitySources(res.sources)
    setNotice(res.aiUsed ? '✨ Locality description generated with AI. Review, edit, then save.' : 'Locality description drafted from form data.')
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
    <div className="mx-auto max-w-3xl space-y-5">
      <Button type="button" variant="ghost" size="sm" onClick={onBack}>← Back to projects</Button>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">GPS &amp; Map — <GradientText>{projectId}</GradientText></h1>
        {loc?.address && <p className="mx-auto mt-2 max-w-lg text-emerald-100/70">{loc.address}</p>}
      </div>

      {/* 1. Choose the location on the map */}
      <Step n={1} title="Choose the property location on the map">
        <p className="mb-3 text-xs text-emerald-100/60">Search a place, click on the map, or type the coordinates below to place the marker.</p>
        <LocationPicker lat={lat} lng={lng} flyTo={flyTo} onPick={(la, ln) => setPoint(la, ln)} />
      </Step>

      {/* 2. GPS coordinates (editable) */}
      <Step n={2} title="GPS coordinates">
        <p className="mb-3 text-xs text-emerald-100/60">
          You can type or paste exact coordinates here — the marker moves as you edit.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Latitude"
            value={latText}
            onChange={(e) => editLat(e.target.value)}
            onBlur={recenter}
            inputMode="decimal"
            placeholder="e.g. 6.845210"
            className="font-mono text-gold-200"
          />
          <Input
            label="Longitude"
            value={lngText}
            onChange={(e) => editLng(e.target.value)}
            onBlur={recenter}
            inputMode="decimal"
            placeholder="e.g. 79.921380"
            className="font-mono text-gold-200"
          />
        </div>
        {!has && (
          <p className="mt-2 text-xs text-emerald-100/50">Pick a point on the map or enter coordinates to continue.</p>
        )}
      </Step>

      {has && (
        <>
          {/* 3. Satellite view (zoomed) */}
          <Step n={3} title="Satellite view">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-[11px] text-emerald-200/60">Close-up</p>
                <MiniMap lat={lat as number} lng={lng as number} variant="satellite" zoom={19} />
              </div>
              <div>
                <p className="mb-1 text-[11px] text-emerald-200/60">Surrounding area</p>
                <MiniMap lat={lat as number} lng={lng as number} variant="satellite" zoom={16} />
              </div>
            </div>
            <a href={gmaps} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-gold-300 hover:text-gold-200">
              Open in Google Maps satellite ↗
            </a>
          </Step>

          {/* 4. Map view */}
          <Step n={4} title="Map view">
            <MiniMap lat={lat as number} lng={lng as number} variant="map" zoom={17} />
          </Step>

          {/* 5. AI access description */}
          <Step n={5} title="ACCESS AND NATURE OF THE ACCESSIBILITY  (from the nearest city)">
            <div className="mb-3 text-center">
              <Button type="button" loading={busy} onClick={generate}>{busy ? 'Generating…' : '✨ Generate access description'}</Button>
            </div>
            <textarea
              value={access}
              onChange={(e) => setAccess(e.target.value)}
              rows={6}
              placeholder="Click Generate to draft how to reach the property from the nearest city…"
              className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/30"
            />
            <SourcesEditor items={accessSources} onChange={setAccessSources} />
          </Step>

          {/* 6. AI locality description */}
          <Step n={6} title="LOCALITY DESCRIPTION (character of the surrounding area)">
            <div className="mb-3 text-center">
              <Button type="button" loading={busyLoc} onClick={generateLocalityDesc}>
                {busyLoc ? 'Generating…' : '✨ Generate locality description'}
              </Button>
            </div>
            <textarea
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              rows={6}
              placeholder="Click Generate to draft the locality / neighbourhood description from the project and map data…"
              className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/30"
            />
            <SourcesEditor items={localitySources} onChange={setLocalitySources} />
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

      <Button type="button" fullWidth variant="success" loading={saving} disabled={!has} onClick={save}>
        {saving ? 'Saving…' : saved ? 'Update Saved Location & Descriptions' : 'OK — Save Location & Descriptions'}
      </Button>

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
