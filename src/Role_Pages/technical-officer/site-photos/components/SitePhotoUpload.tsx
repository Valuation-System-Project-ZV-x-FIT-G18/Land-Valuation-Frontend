import { useCallback, useEffect, useState } from 'react'
import StepFooter from '@/Role_Pages/technical-officer/shared/StepFooter'
import BackButton from '@/Role_Pages/technical-officer/shared/BackButton'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import PhotoRow from '@/Role_Pages/technical-officer/site-photos/components/PhotoRow'
import { photoSections } from '@/Role_Pages/technical-officer/site-photos/constants/photoTypes'
import {
  getPhotos,
  uploadPhoto,
  type UploadedPhoto,
} from '@/Role_Pages/technical-officer/site-photos/api/site-photos'

type SitePhotoUploadProps = { projectId: string; toId: string; onBack: () => void; onDataSaved?: () => void; onReportNavigate?: (section: string) => void }

const SitePhotoUpload = ({ projectId, toId, onBack, onDataSaved, onReportNavigate }: SitePhotoUploadProps) => {
  const [uploaded, setUploaded] = useState<Record<string, UploadedPhoto>>({})

  const load = useCallback(async () => {
    const res = await getPhotos(projectId)
    const map: Record<string, UploadedPhoto> = {}
    res.photos.forEach((p) => (map[p.photoType] = p))
    setUploaded(map)
  }, [projectId])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (photoType: string, file: File, describe: boolean, photoLabel: string, onProgress?: (percent: number) => void) => {
    const res = await uploadPhoto(projectId, toId, photoType, file, describe, photoLabel, onProgress)
    if (res.ok) {
      await load()
      onDataSaved?.()
      onReportNavigate?.('photos')
    }
    return res
  }

  const done = Object.keys(uploaded).length

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <BackButton onClick={onBack} />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Site Photos — <GradientText>{projectId}</GradientText>
        </h1>
        <p className="mt-1 text-sm text-emerald-100">{done} photo(s) uploaded</p>
        <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-emerald-200">Use Camera while on site or Choose file for an existing image. JPEG, PNG or WebP up to 10 MB.</p>
      </div>

      {photoSections.map((section) => (
        <div key={section.title} onFocusCapture={() => onReportNavigate?.('photos')} onMouseDown={() => onReportNavigate?.('photos')}>
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 text-lg font-bold text-white">{section.title}</h2>
          <div className="space-y-2">
            {section.photos.map((p) => (
              <PhotoRow
                key={p.key}
                projectId={projectId}
                photo={p}
                uploaded={uploaded[p.key]}
                describe={section.describe !== false}
                onUpload={handleUpload}
              />
            ))}
          </div>
        </Card>
        </div>
      ))}

      {/* Photos save as they upload, so this step has no save of its own. */}
      <StepFooter
        current="photos"
        nextState={{ projectId }}
        nextDisabled={!done}
        hint="Upload at least one photo to continue."
      />
    </div>
  )
}

export default SitePhotoUpload
