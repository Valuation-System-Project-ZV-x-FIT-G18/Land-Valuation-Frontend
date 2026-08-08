import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

type Props = {
  lat: number | null
  lng: number | null
  onPick: (lat: number, lng: number) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  showSearch?: boolean
  initialView?: 'satellite' | 'map'
  zoom?: number
}

type Place = { display_name: string; lat: string; lon: string }
type FlyPoint = { lat: number; lng: number; zoom: number; nonce: number }

const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718]
const SRI_LANKA_BOUNDS: [[number, number], [number, number]] = [
  [5.75, 79.25],
  [10.05, 82.1],
]

const FlyTo = ({ target }: { target: FlyPoint | null }) => {
  const map = useMap()
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], target.zoom)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.nonce])
  return null
}

const SyncPoint = ({ lat, lng }: { lat: number | null; lng: number | null }) => {
  const map = useMap()
  useEffect(() => {
    if (lat !== null && lng !== null) map.setView([lat, lng], Math.max(map.getZoom(), 17))
  }, [lat, lng, map])
  return null
}

const ClickCapture = ({ onPick, readOnly }: { onPick: (lat: number, lng: number) => void; readOnly: boolean }) => {
  useMapEvents({
    click: (e) => {
      if (!readOnly) onPick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

const OsmLocationPicker = ({
  lat,
  lng,
  onPick,
  placeholder = 'Search an address in Sri Lanka',
  className = 'h-96',
  readOnly = false,
  showSearch = true,
  initialView = 'satellite',
  zoom,
}: Props) => {
  const hasPoint = lat !== null && lng !== null
  const center: [number, number] = hasPoint ? [lat as number, lng as number] : SRI_LANKA_CENTER
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [flyTarget, setFlyTarget] = useState<FlyPoint | null>(null)
  const [satellite, setSatellite] = useState(initialView === 'satellite')

  const focusPlace = (place: Place, keepResults = false) => {
    const nextLat = parseFloat(place.lat)
    const nextLng = parseFloat(place.lon)
    if (Number.isNaN(nextLat) || Number.isNaN(nextLng)) return
    setQuery(place.display_name)
    if (!keepResults) setResults([])
    setFlyTarget({ lat: nextLat, lng: nextLng, zoom: 18, nonce: Date.now() })
    onPick(nextLat, nextLng)
  }

  const search = async () => {
    if (!query.trim()) return
    setSearching(true)
    setError('')
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&dedupe=1&limit=8&countrycodes=lk&q=${encodeURIComponent(`${query.trim()}, Sri Lanka`)}`,
      )
      const found = res.ok ? ((await res.json()) as Place[]) : []
      setResults(found)
      if (found[0]) focusPlace(found[0], true)
      else setError('Location not found. Try adding town, district, or province.')
    } catch {
      setResults([])
      setError('Could not search the map right now.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="space-y-2">
      {showSearch && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                search()
              }
            }}
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-emerald-200/45 focus:border-gold-400/70 focus:ring-2 focus:ring-gold-400/30"
          />
          <button
            type="button"
            onClick={search}
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-gold-400/50 hover:text-gold-200"
          >
            {searching ? 'Searching...' : 'Search'}
          </button>
          <button
            type="button"
            onClick={() => setSatellite((v) => !v)}
            className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:border-gold-400/50 hover:text-gold-200"
          >
            {satellite ? 'Map View' : 'Satellite'}
          </button>
        </div>
      )}
      {results.length > 0 && showSearch && (
        <ul className="relative z-[1000] max-h-48 overflow-auto rounded-xl border border-white/15 bg-emerald-950 shadow-xl">
          {results.map((place, index) => (
            <li key={`${place.lat}-${place.lon}-${index}`}>
              <button
                type="button"
                onClick={() => focusPlace(place)}
                className="block w-full px-4 py-2.5 text-left text-xs text-emerald-100/90 transition hover:bg-white/10"
              >
                {place.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {error && <p className="text-xs text-amber-300">{error}</p>}
      <MapContainer
        center={center}
        zoom={zoom ?? (hasPoint ? 17 : 8)}
        maxZoom={19}
        scrollWheelZoom={!readOnly}
        dragging={!readOnly}
        doubleClickZoom={!readOnly}
        touchZoom={!readOnly}
        boxZoom={!readOnly}
        keyboard={!readOnly}
        zoomControl={!readOnly}
        maxBounds={SRI_LANKA_BOUNDS}
        maxBoundsViscosity={0.8}
        className={`${className} w-full overflow-hidden rounded-xl border border-white/15`}
      >
        {satellite ? (
          <TileLayer
            attribution="Tiles &copy; Esri"
            url="https://clarity.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={20}
            maxNativeZoom={18}
          />
        ) : (
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            maxNativeZoom={19}
          />
        )}
        <ClickCapture onPick={onPick} readOnly={readOnly} />
        <FlyTo target={flyTarget} />
        <SyncPoint lat={lat} lng={lng} />
        {hasPoint && (
          <CircleMarker
            center={[lat as number, lng as number]}
            radius={9}
            pathOptions={{ color: '#E3C24A', fillColor: '#E3C24A', fillOpacity: 0.85 }}
          />
        )}
      </MapContainer>
      <p className="text-xs text-emerald-200/60">
        {hasPoint
          ? `Selected coordinates: ${(lat as number).toFixed(5)}, ${(lng as number).toFixed(5)}`
          : 'Search, zoom, drag, then click the exact property location.'}
      </p>
    </div>
  )
}

export default OsmLocationPicker
