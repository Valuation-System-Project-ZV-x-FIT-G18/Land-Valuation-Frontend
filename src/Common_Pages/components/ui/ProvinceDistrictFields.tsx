import SelectField from '@/Common_Pages/components/ui/SelectField'
import { provinces, districtsByProvince } from '@/Common_Pages/constants/sriLanka'

// Paired Province + District selects: District only offers the districts
// that belong to the chosen Province, and is disabled until one is picked.
// Choosing a new Province clears an out-of-range District automatically.

type ProvinceDistrictFieldsProps = {
  province: string
  district: string
  onChange: (name: 'province' | 'district', value: string) => void
  provinceError?: string
  districtError?: string
  required?: boolean
}

const provinceOptions = [{ value: '', label: 'Select province' }, ...provinces.map((p) => ({ value: p, label: p }))]

const ProvinceDistrictFields = ({
  province,
  district,
  onChange,
  provinceError,
  districtError,
  required = false,
}: ProvinceDistrictFieldsProps) => {
  const districtChoices = province ? (districtsByProvince[province] ?? []) : []
  const districtOptions = [
    { value: '', label: province ? 'Select district' : 'Select province first' },
    ...districtChoices.map((d) => ({ value: d, label: d })),
  ]

  return (
    <>
      <SelectField
        label={required ? 'Province *' : 'Province'}
        name="province"
        value={province}
        onChange={(e) => {
          const value = e.target.value
          onChange('province', value)
          // Drop the district if it no longer belongs to the new province.
          if (district && !(districtsByProvince[value] ?? []).includes(district)) {
            onChange('district', '')
          }
        }}
        options={provinceOptions}
        error={provinceError}
      />
      <SelectField
        label={required ? 'District *' : 'District'}
        name="district"
        value={district}
        onChange={(e) => onChange('district', e.target.value)}
        options={districtOptions}
        error={districtError}
        disabled={!province}
      />
    </>
  )
}

export default ProvinceDistrictFields
