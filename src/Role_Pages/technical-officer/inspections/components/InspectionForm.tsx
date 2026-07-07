import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Modal from '@/Common_Pages/components/ui/Modal'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { inspectionSections } from '@/Role_Pages/technical-officer/inspections/constants/inspectionFields'
import {
  ocrInspection,
  getInspection,
  saveInspection,
  type InspectionData,
} from '@/Role_Pages/technical-officer/inspections/api/inspections'

type InspectionFormProps = { projectId: string; toId: string; onBack: () => void }

const InspectionForm = ({ projectId, toId, onBack }: InspectionFormProps) => {
  const navigate = useNavigate()
  const [data, setData] = useState<InspectionData>({})
  const [savedPrompt, setSavedPrompt] = useState(false) // "go to site photos?" popup
  const [ocrBusy, setOcrBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const [error, setError] = useState('')
  const [rawText, setRawText] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // Pre-fill with any previously saved inspection.
  useEffect(() => {
    getInspection(projectId).then((d) => d && setData(d))
  }, [projectId])

  const set = (key: string, value: string) => setData((d) => ({ ...d, [key]: value }))

  // Fill every inspection field with sample data (testing helper).
  const autoFill = () => {
    setData((d) => {
      const next = { ...d }
      inspectionSections.forEach((s) => s.fields.forEach((f) => { next[f.key] = `Sample ${f.label}` }))
      return next
    })
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setOcrBusy(true)
    setError('')
    setNotice('')
    const res = await ocrInspection(file)
    setOcrBusy(false)
    if (fileRef.current) fileRef.current.value = ''
    setRawText(res.rawText || '')
    const count = Object.keys(res.fields).length
    if (count > 0) {
      setData((d) => ({ ...d, ...res.fields }))
      setNotice(`OCR filled ${count} field(s). Please review and correct below.`)
    } else {
      setError(
        res.ocrError
          ? `OCR could not read the form (${res.ocrError}). Please fill it in manually.`
          : 'OCR found no matching fields. Please fill it in manually.',
      )
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setSaveMsg('')
    const res = await saveInspection(projectId, toId, data)
    setSaving(false)
    if (res.ok) {
      setSaveMsg('✓ Inspection saved to the database.')
      setSavedPrompt(true) // ask whether to move on to Site Photos
    } else {
      setError(res.error ?? 'Could not save. Is the server running?')
    }
  }

  return (
    <div className="space-y-6">
      <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">
        ← Back to projects
      </Button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Inspection — <GradientText>{projectId}</GradientText>
        </h1>
      </div>

      {/* One-click auto-fill for the inspection fields (testing helper). */}
      <div className="text-center">
        <button
          type="button"
          onClick={autoFill}
          className="rounded-lg border border-gold-400/40 bg-gold-400/10 px-4 py-2 text-xs font-medium text-gold-200 transition hover:bg-gold-400/20"
        >
          ⚡ Auto-fill form
        </button>
      </div>

      {/* Upload + OCR */}
      <Card className="p-6 text-center">
        <p className="text-sm text-emerald-100/80">
          Upload the filled inspection form (PDF or image) to auto-fill the draft below.
        </p>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/25 px-5 py-3 text-sm text-emerald-100/80 transition hover:border-gold-400/50 hover:text-gold-200">
          {ocrBusy ? 'Reading with OCR…' : '📄 Choose file & extract'}
          <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={ocrBusy} onChange={onFile} />
        </label>
        {notice && <p className="mt-3 text-sm text-emerald-200">{notice}</p>}
        {error && <p className="mt-3 text-sm text-amber-300">{error}</p>}
      </Card>

      {/* Editable draft */}
      {inspectionSections.map((section) => (
        <Card key={section.title} className="p-5 sm:p-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
            <span>{section.icon}</span> {section.title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {section.fields.map((f) => (
              <div key={f.key} className={f.textarea ? 'sm:col-span-2' : ''}>
                <label className="mb-1.5 block text-sm font-medium text-emerald-100">{f.label}</label>
                {f.textarea ? (
                  <textarea
                    value={data[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    rows={2}
                    className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/30"
                  />
                ) : (
                  <input
                    value={data[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/30"
                  />
                )}
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Raw OCR text (reference) */}
      {rawText && (
        <details className="rounded-xl border border-white/10 bg-white/5 p-4">
          <summary className="cursor-pointer text-sm font-medium text-emerald-200/70">
            Raw OCR text (for reference)
          </summary>
          <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap text-xs text-emerald-100/60">
            {rawText}
          </pre>
        </details>
      )}

      {error && <p className="text-center text-sm text-red-300">{error}</p>}
      {saveMsg && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center text-sm font-medium text-emerald-200">
          {saveMsg}
        </div>
      )}
      <Button type="button" fullWidth disabled={saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'OK — Save Inspection'}
      </Button>

      {/* After saving: offer to continue to Site Photos. */}
      <Modal open={savedPrompt} onClose={() => setSavedPrompt(false)}>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400/15 text-2xl">
            ✓
          </div>
          <h3 className="mt-4 text-2xl">
            <GradientText>Inspection Saved</GradientText>
          </h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100/70">
            The inspection data for {projectId} has been saved. Upload the site
            photos next?
          </p>
          <div className="mt-5 flex gap-3">
            <Button
              type="button"
              fullWidth
              onClick={() => navigate('/technical-officer/site-photos', { state: { projectId } })}
            >
              Yes, upload photos
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={() => setSavedPrompt(false)}>
              Not now
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default InspectionForm
