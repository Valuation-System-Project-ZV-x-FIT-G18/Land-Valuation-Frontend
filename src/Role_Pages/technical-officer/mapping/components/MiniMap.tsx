import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Read-only, zoomed view of the chosen location.
type Props = { lat: number; lng: number; variant: 'satellite' | 'map'; zoom?: number }

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
    attribution: 'Tiles &copy; Esri',
    maxNativeZoom: 18,
  },
  map: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    maxNativeZoom: 19,
  },
}

const MiniMap = ({ lat, lng, variant, zoom = 18 }: Props) => {
  const layer = LAYERS[variant]
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={zoom}
      scrollWheelZoom={false}
      maxZoom={20}
      className="h-72 w-full overflow-hidden rounded-xl border border-white/15"
    >
      <TileLayer
        attribution={layer.attribution}
        url={layer.url}
        maxZoom={20}
        maxNativeZoom={layer.maxNativeZoom}
      />
      <Recenter lat={lat} lng={lng} zoom={zoom} />
      <CircleMarker
        center={[lat, lng]}
        radius={10}
        pathOptions={{ color: '#E3C24A', fillColor: '#E3C24A', fillOpacity: 0.6 }}
      />
    </MapContainer>
  )
}

export default MiniMap
