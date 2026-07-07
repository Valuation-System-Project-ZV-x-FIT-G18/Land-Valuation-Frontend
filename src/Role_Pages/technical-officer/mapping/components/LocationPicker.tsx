import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Interactive map — the officer searches for / clicks the exact property spot.
// Free OpenStreetMap + Esri satellite tiles and Nominatim search (no API key).
type FlyPoint = { lat: number; lng: number; zoom: number; nonce: number }
type Props = {
  lat: number | null
  lng: number | null
  onPick: (lat: number, lng: number) => void
  flyTo?: FlyPoint | null // parent-driven recenter (e.g. after editing the coordinates)
}

type Place = { display_name: string; lat: string; lon: string }

const ClickCapture = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

// Flies the map to a search result. Keyed by `nonce` so it only moves when a
// new search is chosen — not on every map click (which would fight the user).
const FlyTo = ({ target }: { target: FlyPoint | null }) => {
  const map = useMap()
  useEffect(() => {
    if (target) map.setView([target.lat, target.lng], target.zoom)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.nonce])
  return null
}

const LocationPicker = ({ lat, lng, onPick, flyTo }: Props) => {
  const has = lat !== null && lng !== null
  const latNum = has ? (lat as number) : 7.8731 // centre of Sri Lanka
  const lngNum = has ? (lng as number) : 80.7718

  const [sat, setSat] = useState(true) // satellite is clearer for spotting a property
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Place[]>([])
  const [searching, setSearching] = useState(false)
  const [flyTarget, setFlyTarget] = useState<FlyPoint | null>(null)

  // Free geocoding via OpenStreetMap Nominatim, biased to Sri Lanka.
  const search = async () => {
    if (!q.trim()) return
    setSearching(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=6&countrycodes=lk&q=${encodeURIComponent(q.trim())}`,
      )
      setResults(res.ok ? await res.json() : [])
    } catch {
      setResults([])
    } finally {
      setSearching(false)
    }
  }

  const choose = (p: Place) => {
    const la = parseFloat(p.lat)
    const ln = parseFloat(p.lon)
    setResults([])
    setQ(p.display_name)
    setFlyTarget({ lat: la, lng: ln, zoom: 17, nonce: Date.now() })
    onPick(la, ln) // drop the marker there; user can fine-tune by clicking
  }

  return (
    <div className="space-y-2">
      {/* Search + layer toggle */}
      <div className="relative flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); search() } }}
            placeholder="Search a place, town or address (e.g. Rukmale, Maharagama)…"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/30"
          />
          {results.length > 0 && (
            <ul className="absolute z-[1000] mt-1 max-h-56 w-full overflow-auto rounded-xl border border-white/15 bg-emerald-950 shadow-xl">
              {results.map((p, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => choose(p)}
                    className="block w-full px-4 py-2 text-left text-xs text-emerald-100/90 transition hover:bg-white/10"
                  >
                    {p.display_name}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={search}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-emerald-100 transition hover:border-gold-400/50 hover:text-gold-200"
        >
          {searching ? 'Searching…' : '🔍 Search'}
        </button>
        <button
          type="button"
          onClick={() => setSat((s) => !s)}
          className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-emerald-100 transition hover:border-gold-400/50 hover:text-gold-200"
        >
          {sat ? '🗺️ Map view' : '🛰️ Satellite'}
        </button>
      </div>

      <MapContainer
        center={[latNum, lngNum]}
        zoom={has ? 16 : 8}
        scrollWheelZoom
        className="h-[28rem] w-full overflow-hidden rounded-xl border border-white/15"
      >
        {sat ? (
          <TileLayer
            attribution="Tiles &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={20}
          />
        ) : (
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        )}
        <ClickCapture onPick={onPick} />
        <FlyTo target={flyTarget} />
        <FlyTo target={flyTo ?? null} />
        {has && (
          <CircleMarker
            center={[latNum, lngNum]}
            radius={9}
            pathOptions={{ color: '#E3C24A', fillColor: '#E3C24A', fillOpacity: 0.85 }}
          />
        )}
      </MapContainer>

      <p className="text-[11px] text-emerald-200/50">
        Scroll to zoom, drag to pan, and click the exact property to place the marker.
      </p>
    </div>
  )
}

export default LocationPicker
