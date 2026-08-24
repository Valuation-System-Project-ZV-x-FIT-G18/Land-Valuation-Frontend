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
  existingFileName?: string
  existingFileUrl?: string
  onRemoveExisting?: (name: string) => void
}

const FileField = ({
  label,
  name,
  accept,
  files,
  onChange,
  multiple,
  error,
  existingFileName,
  existingFileUrl,
  onRemoveExisting,
}: FileFieldProps) => {
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

  const view = (file: File) => {
    const url = URL.createObjectURL(file)
    window.open(url, '_blank', 'noopener,noreferrer')
    // Keep the object URL alive long enough for the new tab to load it.
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
  }

  const shownError = error || localError

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-emerald-100">{label}</label>

      <input
        id={`${name}-upload`}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handle}
        className="hidden"
      />

      <div
        className={`flex min-h-14 items-center justify-center rounded-xl border border-dashed px-4 py-3 text-sm transition ${
          shownError
            ? 'border-red-400/70 text-red-200'
            : files.length || existingFileName
              ? 'border-gold-400/35 bg-gold-400/5 text-emerald-100/80'
              : 'border-white/20 text-emerald-100/70 hover:border-gold-400/50'
        }`}
      >
        {files.length === 0 && !existingFileName ? (
          <label
            htmlFor={`${name}-upload`}
            className="flex w-full cursor-pointer items-center gap-2 transition hover:text-gold-200"
          >
            <span>Choose file{multiple ? 's' : ''}</span>
            <span className="ml-auto text-xs text-emerald-200/40">{accept} · max 5MB</span>
          </label>
        ) : files.length === 0 && existingFileName ? (
          <div className="min-w-0 text-center">
            <div className="flex min-w-0 items-center justify-center gap-2">
              <span className="max-w-56 truncate text-xs font-medium text-gold-100" title={existingFileName}>
                {existingFileName}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-center gap-4 text-xs font-medium">
              {existingFileUrl && (
                <a
                  href={existingFileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold-300 transition hover:text-gold-200 hover:underline"
                >
                  View
                </a>
              )}
              <label
                htmlFor={`${name}-upload`}
                className="cursor-pointer text-emerald-200/70 transition hover:text-gold-200 hover:underline"
              >
                Replace
              </label>
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(name)}
                  className="text-emerald-200/60 transition hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ) : (
          <ul className="w-full space-y-2">
            {files.map((f, i) => (
              <li key={`${f.name}-${i}`} className="flex min-w-0 items-center justify-center gap-3">
                <span className="max-w-48 truncate text-center text-xs" title={f.name}>
                  {f.name}{' '}
                  <span className="text-emerald-200/40">({(f.size / 1024).toFixed(0)} KB)</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => view(f)}
                    className="font-medium text-gold-300 transition hover:text-gold-200 hover:underline"
                  >
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    aria-label={`Remove ${f.name}`}
                    className="text-emerald-200/60 transition hover:text-red-300"
                  >
                    ✕
                  </button>
                </span>
              </li>
            ))}
            <li className="border-t border-white/10 pt-2 text-center">
              <div className="flex flex-wrap items-center justify-center gap-3">
                <label
                  htmlFor={`${name}-upload`}
                  className="cursor-pointer text-xs font-medium text-emerald-200/70 transition hover:text-gold-200 hover:underline"
                >
                  {multiple ? '+ Add more files' : '↻ Replace file'}
                </label>
              </div>
            </li>
          </ul>
        )}
      </div>

      {shownError && <p className="mt-1.5 text-xs text-red-300">{shownError}</p>}
    </div>
  )
}

export default FileField
