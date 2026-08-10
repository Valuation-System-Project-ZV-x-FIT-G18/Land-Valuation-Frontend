import OsmLocationPicker from '@/Common_Pages/components/ui/OsmLocationPicker'
import Input from '@/Common_Pages/components/ui/Input'

type MapPickerProps = {
  lat: string
  lng: string
  onPick: (lat: number, lng: number) => void
  onTextChange: (lat: string, lng: string) => void
}

const MapPicker = ({ lat, lng, onPick, onTextChange }: MapPickerProps) => {
  const latNum = lat ? Number(lat) : null
  const lngNum = lng ? Number(lng) : null
  const hasPoint = Number.isFinite(latNum) && Number.isFinite(lngNum)

  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-sm font-medium text-emerald-100">Choose Location</label>
      <OsmLocationPicker
        lat={hasPoint ? latNum : null}
        lng={hasPoint ? lngNum : null}
        onPick={onPick}
        placeholder="Search property address in Sri Lanka"
        className="h-96"
      />
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Input
          label="Latitude"
          value={lat}
          onChange={(e) => {
            const nextValue = e.target.value
            onTextChange(nextValue, lng)
            const nextLat = Number(nextValue)
            const currentLng = lng ? Number(lng) : null
            if (Number.isFinite(nextLat) && currentLng !== null && Number.isFinite(currentLng)) {
              onPick(nextLat, currentLng)
            }
          }}
          inputMode="decimal"
          placeholder="e.g. 6.0976100"
          className="font-mono text-gold-200"
        />
        <Input
          label="Longitude"
          value={lng}
          onChange={(e) => {
            const nextValue = e.target.value
            onTextChange(lat, nextValue)
            const currentLat = lat ? Number(lat) : null
            const nextLng = Number(nextValue)
            if (currentLat !== null && Number.isFinite(currentLat) && Number.isFinite(nextLng)) {
              onPick(currentLat, nextLng)
            }
          }}
          inputMode="decimal"
          placeholder="e.g. 80.8712300"
          className="font-mono text-gold-200"
        />
      </div>
    </div>
  )
}

export default MapPicker
