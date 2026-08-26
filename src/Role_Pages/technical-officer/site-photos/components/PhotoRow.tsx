import { useEffect, useRef, useState } from 'react'
import type { PhotoType } from '@/Role_Pages/technical-officer/site-photos/constants/photoTypes'
import type { UploadedPhoto } from '@/Role_Pages/technical-officer/site-photos/api/site-photos'
import { photoUrl } from '@/Role_Pages/technical-officer/site-photos/api/site-photos'

type PhotoRowProps = {
  projectId: string
  photo: PhotoType
  uploaded?: UploadedPhoto
  describe?: boolean
  onUpload: (
    photoType: string,
    file: File,
    describe: boolean,
    photoLabel: string,
    onProgress?: (percent: number) => void,
  ) => Promise<{ ok: boolean; error?: string; description?: string }>
}

const PhotoRow = ({ projectId, photo, uploaded, describe = false, onUpload }: PhotoRowProps) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [caption, setCaption] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const [progress, setProgress] = useState(0)
  const has = !!uploaded?.fileName
  // Show the freshly returned caption, or the one saved with the photo.
  const shownCaption = caption || uploaded?.description || ''

  useEffect(() => {
    if (!has) {
      setPreviewUrl('')
      return
    }

    let cancelled = false
    let objectUrl = ''
    fetch(photoUrl(projectId, photo.key, uploaded?.createdAt))
      .then((response) => {
        if (!response.ok) throw new Error('Could not load photo preview.')
        return response.blob()
      })
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setPreviewUrl(objectUrl)
      })
      .catch(() => {
        if (!cancelled) setPreviewUrl('')
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [has, photo.key, projectId, uploaded?.createdAt])

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Choose a JPEG, PNG or WebP image.')
      e.target.value = ''
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('This image is larger than 10 MB. Choose a smaller image.')
      e.target.value = ''
      return
    }
    setBusy(true)
    setProgress(0)
    setError('')
    setCaption('')
    const res = await onUpload(photo.key, file, describe, photo.label, setProgress)
    setBusy(false)
    if (!res.ok) setError(res.error ?? 'Upload failed.')
    else if (res.description) setCaption(res.description)
    if (inputRef.current) inputRef.current.value = ''
    if (cameraRef.current) cameraRef.current.value = ''
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-3 sm:flex-row sm:items-center">
      {/* Thumbnail / placeholder */}
      {has && previewUrl ? (
        <a href={previewUrl || undefined} target="_blank" rel="noreferrer" className="shrink-0">
          <img
            src={previewUrl}
            alt={photo.label}
            className="h-14 w-14 rounded-lg border border-white/10 object-cover"
          />
        </a>
      ) : has ? (
        <span className="h-14 w-14 shrink-0 animate-pulse rounded-lg border border-white/10 bg-white/5" aria-label="Loading photo preview" />
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/20 px-1 text-center text-[10px] text-emerald-200">No image</span>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">{photo.label}</p>
        <p className={`mt-0.5 text-[11px] font-semibold uppercase tracking-wide ${has ? 'text-emerald-300' : 'text-emerald-200'}`}>{has ? 'Uploaded' : 'Not uploaded'}</p>
        {has && <p className="truncate text-xs text-emerald-200">{uploaded?.fileName}</p>}
        {busy && describe && <p className="text-xs text-emerald-200 italic">Describing image…</p>}
        {shownCaption && (
          <p className="mt-1 rounded-md bg-accent-400/10 px-2 py-1 text-xs italic text-accent-100">
            {shownCaption}
          </p>
        )}
        {error && <p className="text-xs text-red-300">{error}</p>}
        {busy && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/25" aria-label={`Upload ${progress}% complete`}>
            <div className="h-full rounded-full bg-accent-400 transition-all" style={{ width: `${Math.max(progress, 8)}%` }} />
          </div>
        )}
      </div>

      <div className="flex w-full shrink-0 gap-2 sm:w-auto">
        <label className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:border-accent-400/50 hover:text-accent-200 sm:flex-none">
          {busy ? `Uploading ${progress}%` : 'Camera'}
          <input ref={cameraRef} type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="hidden" disabled={busy} onChange={pick} />
        </label>
        <label className="flex min-h-11 flex-1 cursor-pointer items-center justify-center rounded-lg border border-white/15 px-3 py-2 text-xs font-medium text-emerald-100 transition hover:border-accent-400/50 hover:text-accent-200 sm:flex-none">
          {has ? 'Replace file' : 'Choose file'}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={busy} onChange={pick} />
        </label>
      </div>
    </div>
  )
}

export default PhotoRow
