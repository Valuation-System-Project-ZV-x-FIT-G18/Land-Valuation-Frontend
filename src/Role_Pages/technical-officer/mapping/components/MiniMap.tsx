import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Read-only, zoomed view of the chosen location.
//  - variant "satellite": free Esri World Imagery (no API key)
//  - variant "map": OpenStreetMap street map
type Props = { lat: number; lng: number; variant: 'satellite' | 'map'; zoom?: number }

// MapContainer only reads center/zoom once, so keep the view in sync when the
// selected coordinates change (otherwise the mini-map stays on the first spot).
const Recenter = ({ lat, lng, zoom }: { lat: number; lng: number; zoom: number }) => {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], zoom)
  }, [lat, lng, zoom, map])
  return null
}

const LAYERS = {
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
  },
  map: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
}

const MiniMap = ({ lat, lng, variant, zoom = 18 }: Props) => {
  const layer = LAYERS[variant]
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      className="h-72 w-full overflow-hidden rounded-xl border border-white/15"
    >
      <TileLayer attribution={layer.attribution} url={layer.url} maxZoom={variant === 'satellite' ? 20 : 19} />
      <Recenter lat={lat} lng={lng} zoom={zoom} />
      <CircleMarker center={[lat, lng]} radius={10} pathOptions={{ color: '#E3C24A', fillColor: '#E3C24A', fillOpacity: 0.6 }} />
    </MapContainer>
  )
}

export default MiniMap
