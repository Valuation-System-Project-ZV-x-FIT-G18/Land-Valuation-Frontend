import OsmLocationPicker from '@/Common_Pages/components/ui/OsmLocationPicker'

type Props = {
  lat: number | null
  lng: number | null
  onPick: (lat: number, lng: number) => void
}

const LocationPicker = ({ lat, lng, onPick }: Props) => (
  <OsmLocationPicker
    lat={lat}
    lng={lng}
    onPick={onPick}
    placeholder="Search property address or nearby place in Sri Lanka"
    className="h-[32rem]"
  />
)

export default LocationPicker
