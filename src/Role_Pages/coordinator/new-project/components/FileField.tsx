import { useState } from 'react'

// Reusable upload field: picks one or more files, enforces a 5MB-per-file limit,
// shows the chosen files, and lets you remove them. Mobile-friendly (opens the
// native picker / camera).

const MAX_BYTES = 5 * 1024 * 1024

type FileFieldProps = {
  label: string
  name: string
  accept: string // e.g. '.pdf,.jpg,.jpeg,.png'
  files: File[]
  onChange: (name: string, files: File[]) => void
  multiple?: boolean
  error?: string
}

const FileField = ({ label, name, accept, files, onChange, multiple, error }: FileFieldProps) => {
  const [localError, setLocalError] = useState('')

  const handle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    const tooBig = picked.find((f) => f.size > MAX_BYTES)
    if (tooBig) {
      setLocalError(`"${tooBig.name}" is larger than 5MB.`)
      return
    }
    setLocalError('')
    onChange(name, multiple ? [...files, ...picked] : picked.slice(0, 1))
    e.target.value = '' // allow re-selecting the same file
  }

  const remove = (i: number) => onChange(name, files.filter((_, idx) => idx !== i))

  const shownError = error || localError

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-emerald-100">{label}</label>

      <label
        className={`flex cursor-pointer items-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm transition ${
          shownError
            ? 'border-red-400/70 text-red-200'
            : 'border-white/20 text-emerald-100/70 hover:border-gold-400/50 hover:text-gold-200'
        }`}
      >
        <span>📎 Choose file{multiple ? 's' : ''}</span>
        <span className="ml-auto text-xs text-emerald-200/40">{accept} · max 5MB</span>
        <input type="file" accept={accept} multiple={multiple} onChange={handle} className="hidden" />
      </label>

      {files.length > 0 && (
        <ul className="mt-2 space-y-1">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-1.5 text-xs text-emerald-100/80"
            >
              <span className="truncate">
                {f.name}{' '}
                <span className="text-emerald-200/40">({(f.size / 1024).toFixed(0)} KB)</span>
              </span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="ml-2 shrink-0 text-emerald-200/60 transition hover:text-red-300"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {shownError && <p className="mt-1.5 text-xs text-red-300">{shownError}</p>}
    </div>
  )
}

export default FileField
