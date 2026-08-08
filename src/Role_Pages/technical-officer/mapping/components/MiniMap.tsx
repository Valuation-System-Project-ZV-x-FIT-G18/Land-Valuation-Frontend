import OsmLocationPicker from '@/Common_Pages/components/ui/OsmLocationPicker'

type Props = { lat: number; lng: number; variant: 'satellite' | 'map'; zoom?: number }

const MiniMap = ({ lat, lng, variant, zoom }: Props) => (
  <OsmLocationPicker
    lat={lat}
    lng={lng}
    onPick={() => {}}
    readOnly
    showSearch={false}
    initialView={variant}
    zoom={zoom}
    className="h-72"
  />
)

export default MiniMap
