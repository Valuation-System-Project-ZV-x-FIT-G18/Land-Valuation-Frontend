import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Lets the coordinator search, zoom and click the exact property GPS location.

type MapPickerProps = {
  lat: string
  lng: string
  onPick: (lat: number, lng: number) => void
}

type Place = { display_name: string; lat: string; lon: string }
type FlyPoint = { lat: number; lng: number; zoom: number; nonce: number }

const SRI_LANKA_BOUNDS: [[number, number], [number, number]] = [
  [5.75, 79.25],
  [10.05, 82.1],
]

const ClickCapture = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

const FlyTo = ({ target }: { target: FlyPoint | null }) => {
  const map = useMap()
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], target.zoom)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.nonce])
  return null
}

const MapPicker = ({ lat, lng, onPick }: MapPickerProps) => {
  const hasPoint = lat !== '' && lng !== ''
  const latNum = hasPoint ? parseFloat(lat) : 7.8731 // centre of Sri Lanka
  const lngNum = hasPoint ? parseFloat(lng) : 80.7718
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [searching, setSearching] = useState(false)
  const [flyTarget, setFlyTarget] = useState<FlyPoint | null>(null)
  const [satellite, setSatellite] = useState(true)

  const search = async () => {
    if (!query.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=8&countrycodes=lk&q=${encodeURIComponent(query.trim())}`,
      )
      setResults(res.ok ? await res.json() : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const choose = (place: Place) => {
    const nextLat = parseFloat(place.lat)
    const nextLng = parseFloat(place.lon)
    if (Number.isNaN(nextLat) || Number.isNaN(nextLng)) return
    setQuery(place.display_name)
    setResults([])
    setFlyTarget({ lat: nextLat, lng: nextLng, zoom: 17, nonce: Date.now() })
    onPick(nextLat, nextLng)
  }

  return (
    <div className="sm:col-span-2">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm font-medium text-emerald-100">
          <span className="mb-1.5 block">Choose Location</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                search()
              }
            }}
            placeholder="Search any place in Sri Lanka"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-emerald-200/45 focus:border-gold-400/70 focus:ring-2 focus:ring-gold-400/30"
          />
        </label>
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
      {results.length > 0 && (
        <ul className="relative z-[1000] mb-3 max-h-48 overflow-auto rounded-xl border border-white/15 bg-emerald-950 shadow-xl">
          {results.map((place, index) => (
            <li key={`${place.lat}-${place.lon}-${index}`}>
              <button
                type="button"
                onClick={() => choose(place)}
                className="block w-full px-4 py-2.5 text-left text-xs text-emerald-100/90 transition hover:bg-white/10"
              >
                {place.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <MapContainer
        center={[latNum, lngNum]}
        zoom={hasPoint ? 16 : 8}
        scrollWheelZoom
        maxBounds={SRI_LANKA_BOUNDS}
        maxBoundsViscosity={0.8}
        className="h-96 w-full overflow-hidden rounded-xl border border-white/15"
      >
        {satellite ? (
          <>
            <TileLayer
              attribution="Tiles &copy; Esri"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={20}
            />
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              opacity={0.28}
              maxZoom={19}
            />
          </>
        ) : (
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}
        <ClickCapture onPick={onPick} />
        <FlyTo target={flyTarget} />
        {hasPoint && (
          <CircleMarker
            center={[latNum, lngNum]}
            radius={9}
            pathOptions={{ color: '#E3C24A', fillColor: '#E3C24A', fillOpacity: 0.85 }}
          />
        )}
      </MapContainer>
      <p className="mt-2 text-xs text-emerald-200/60">
        {hasPoint
          ? `Selected coordinates: ${latNum.toFixed(5)}, ${lngNum.toFixed(5)}`
          : 'Search, zoom, drag, then click the exact property location.'}
      </p>
    </div>
  )
}

export default MapPicker
