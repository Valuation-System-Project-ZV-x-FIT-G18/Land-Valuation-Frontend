import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const navigate = useNavigate()
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

  const handleUpload = async (photoType: string, file: File, describe: boolean, photoLabel: string) => {
    const res = await uploadPhoto(projectId, toId, photoType, file, describe, photoLabel)
    if (res.ok) {
      await load()
      onDataSaved?.()
      onReportNavigate?.('photos')
    }
    return res
  }

  const done = Object.keys(uploaded).length

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">
        ← Back to projects
      </Button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Site Photos — <GradientText>{projectId}</GradientText>
        </h1>
        <p className="mt-1 text-sm text-emerald-100/70">{done} photo(s) uploaded</p>
      </div>

      {photoSections.map((section) => (
        <div key={section.title} onFocusCapture={() => onReportNavigate?.('photos')} onMouseDown={() => onReportNavigate?.('photos')}>
        <Card className="p-5 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span>{section.icon}</span> {section.title}
          </h2>
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

      {/* Photos save on upload — continue to the next step in the flow. */}
      <Button
        type="button"
        fullWidth
        disabled={!done}
        onClick={() => navigate('/technical-officer/gps-map', { state: { projectId } })}
      >
        {done ? 'Done — Continue to GPS & Map →' : 'Upload at least one photo to continue'}
      </Button>
    </div>
  )
}

export default SitePhotoUpload
