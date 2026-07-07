import { useRef, useState } from 'react'
import type { DocType } from '@/Role_Pages/loan-applicant/documents/constants/documentTypes'
import type { UploadedDoc } from '@/Role_Pages/loan-applicant/documents/api/documents'
import { documentUrl } from '@/Role_Pages/loan-applicant/documents/api/documents'

// Colored pill for a document's status.
const statusTone = (s: string) => {
  const v = s.toLowerCase()
  if (v.includes('approve')) return 'border-emerald-400/30 bg-emerald-500/15 text-emerald-200'
  if (v.includes('resubmit') || v.includes('reject')) return 'border-red-400/30 bg-red-500/15 text-red-200'
  if (v.includes('submit')) return 'border-amber-400/30 bg-amber-400/15 text-amber-200'
  return 'border-white/20 bg-white/10 text-emerald-100/60' // Pending
}

type DocumentRowProps = {
  nic: string
  doc: DocType
  uploaded?: UploadedDoc
  onUpload: (docType: string, file: File) => Promise<{ ok: boolean; error?: string }>
}

const DocumentRow = ({ nic, doc, uploaded, onUpload }: DocumentRowProps) => {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const status = uploaded?.status || 'Pending'

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setBusy(true)
    setError('')
    const res = await onUpload(doc.key, file)
    setBusy(false)
    if (!res.ok) setError(res.error ?? 'Upload failed.')
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white">
          {doc.label}
          {doc.mandatory && <span className="ml-1 text-gold-300">*</span>}
        </p>
        {uploaded?.fileName && (
          <a
            href={documentUrl(nic, doc.key)}
            className="mt-0.5 inline-flex items-center gap-1 text-xs text-gold-200 underline"
          >
            📎 {uploaded.fileName}
          </a>
        )}
        {error && <p className="mt-0.5 text-xs text-red-300">{error}</p>}
      </div>

      <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-semibold ${statusTone(status)}`}>
        {status}
      </span>

      <label className="shrink-0 cursor-pointer rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-emerald-100/80 transition hover:border-gold-400/50 hover:text-gold-200">
        {busy ? 'Uploading…' : uploaded?.fileName ? 'Replace' : 'Upload'}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="hidden"
          disabled={busy}
          onChange={pick}
        />
      </label>
    </div>
  )
}

export default DocumentRow
