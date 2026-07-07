import { useRef, useState } from 'react'
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
  ) => Promise<{ ok: boolean; error?: string; description?: string }>
}

const PhotoRow = ({ projectId, photo, uploaded, describe = false, onUpload }: PhotoRowProps) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [caption, setCaption] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const has = !!uploaded?.fileName
  // Show the freshly returned caption, or the one saved with the photo.
  const shownCaption = caption || uploaded?.description || ''

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    setCaption('')
    const res = await onUpload(photo.key, file, describe, photo.label)
    setBusy(false)
    if (!res.ok) setError(res.error ?? 'Upload failed.')
    else if (res.description) setCaption(res.description)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
      {/* Thumbnail / placeholder */}
      {has ? (
        <a href={photoUrl(projectId, photo.key)} target="_blank" rel="noreferrer" className="shrink-0">
          <img
            src={photoUrl(projectId, photo.key, uploaded?.createdAt)}
            alt={photo.label}
            className="h-14 w-14 rounded-lg border border-white/10 object-cover"
          />
        </a>
      ) : (
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/20 text-lg text-emerald-200/40">
          🖼️
        </span>
      )}

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-medium text-white">
          <span className={has ? 'text-emerald-300' : 'text-emerald-200/40'}>{has ? '☑' : '☐'}</span>
          {photo.label}
        </p>
        {has && <p className="truncate text-xs text-emerald-200/50">{uploaded?.fileName}</p>}
        {busy && describe && <p className="text-xs text-emerald-200/50 italic">Describing image…</p>}
        {shownCaption && (
          <p className="mt-1 rounded-md bg-gold-400/10 px-2 py-1 text-xs italic text-gold-100/90">
            🤖 {shownCaption}
          </p>
        )}
        {error && <p className="text-xs text-red-300">{error}</p>}
      </div>

      <label className="shrink-0 cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-emerald-100/80 transition hover:border-gold-400/50 hover:text-gold-200">
        {busy ? 'Uploading…' : has ? 'Replace' : 'Upload'}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" disabled={busy} onChange={pick} />
      </label>
    </div>
  )
}

export default PhotoRow
