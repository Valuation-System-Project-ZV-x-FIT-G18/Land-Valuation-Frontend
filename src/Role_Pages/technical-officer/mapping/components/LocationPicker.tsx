import OsmLocationPicker from '@/Common_Pages/components/ui/OsmLocationPicker'

type FlyPoint = { lat: number; lng: number; zoom: number; nonce: number }

type Props = {
  lat: number | null
  lng: number | null
  onPick: (lat: number, lng: number) => void
  flyTo?: FlyPoint | null
}

const LocationPicker = ({ lat, lng, onPick }: Props) => (
  <OsmLocationPicker
    lat={lat}
    lng={lng}
    onPick={onPick}
    placeholder="Search property address or nearby place in Sri Lanka"
    className="h-[28rem]"
  />
)

export default LocationPicker
