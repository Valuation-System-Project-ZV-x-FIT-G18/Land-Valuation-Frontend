import { MapContainer, TileLayer, CircleMarker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Lets the coordinator click the map to set the property's GPS location.
// Uses free OpenStreetMap tiles and a circle marker (no icon assets needed).

type MapPickerProps = {
  lat: string
  lng: string
  onPick: (lat: number, lng: number) => void
}

const ClickCapture = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

const MapPicker = ({ lat, lng, onPick }: MapPickerProps) => {
  const hasPoint = lat !== '' && lng !== ''
  const latNum = hasPoint ? parseFloat(lat) : 7.8731 // centre of Sri Lanka
  const lngNum = hasPoint ? parseFloat(lng) : 80.7718

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-emerald-100">
        Map Location (click to place the property marker)
      </label>
      <MapContainer
        center={[latNum, lngNum]}
        zoom={hasPoint ? 14 : 7}
        scrollWheelZoom={false}
        className="h-72 w-full overflow-hidden rounded-xl border border-white/15"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCapture onPick={onPick} />
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
          : 'Click anywhere on the map to set the property location.'}
      </p>
    </div>
  )
}

export default MapPicker
