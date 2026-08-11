import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
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

const printableInspectionSections = [
  {
    ...inspectionSections[0],
    fields: [
      ...inspectionSections[0].fields.slice(0, 5),
      { key: 'gpsCoordinates', label: 'GPS Coordinates' },
      ...inspectionSections[0].fields.slice(5),
    ],
  },
  ...inspectionSections.slice(1, 4),
  {
    title: 'Valuation Figures',
    icon: '',
    fields: [
      { key: 'adoptedPerPerchRate', label: 'Adopted per perch rate' },
      { key: 'landMarketValue', label: 'Land Market Value' },
      { key: 'forcedSaleValue', label: 'Forced Sale Value' },
      { key: 'valuationNotes', label: 'Valuation notes', textarea: true },
    ],
  },
  inspectionSections[4],
]

const fieldHints: Record<string, string> = {
  accessRoute: 'Describe the route from the nearest town, including landmarks and turns',
  roadWidth: 'e.g. 20 ft',
  roadType: 'e.g. Tarred road',
  roadFacing: 'e.g. Northern boundary',
  distanceFromNearestCity: 'e.g. 4.5 km',
  rightOfWay: 'State whether access is legally established',
  landShape: 'e.g. Rectangular / Irregular',
  landPosition: 'e.g. At road level / Above road level',
  frontage: 'Enter measurement in feet',
  floodProne: 'Describe observed or reported flood risk',
  boundariesMarked: 'State how boundaries are identified on site',
  soilType: 'e.g. Laterite / Sandy / Clay',
  drainage: 'Describe natural or constructed drainage',
  garbage: 'Describe the available disposal method',
  gateType: 'e.g. Steel swing gate',
  unauthorizedStructures: 'Enter details, or state “None observed”',
  northBoundary: 'Describe the northern boundary',
  eastBoundary: 'Describe the eastern boundary',
  southBoundary: 'Describe the southern boundary',
  westBoundary: 'Describe the western boundary',
  boundariesMatchPlan: 'Record whether site boundaries agree with the survey plan',
  vicinityCharacter: 'Summarize the surrounding development and land use',
  nearbyFacilities: 'Schools, hospitals, shops, banks and other facilities',
  transportFrequency: 'Describe public transport availability and frequency',
  dayToDayNeeds: 'Describe access to everyday goods and services',
  presentedParty: 'Full name and relationship to the property',
  technicalOfficer: 'Full name of the inspecting officer',
  signature: 'Enter signer name or signature reference',
}

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

  const totalFields = useMemo(
    () => inspectionSections.reduce((total, section) => total + section.fields.length, 0),
    [],
  )
  const completedFields = useMemo(
    () => inspectionSections.reduce(
      (total, section) => total + section.fields.filter((field) => data[field.key]?.trim()).length,
      0,
    ),
    [data],
  )
  const completion = Math.round((completedFields / totalFields) * 100)

  // Pre-fill with any previously saved inspection.
  useEffect(() => {
    getInspection(projectId).then((d) => d && setData(d))
  }, [projectId])

  const set = (key: string, value: string) => setData((d) => ({ ...d, [key]: value }))

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setOcrBusy(true)
    setError('')
    setNotice('')
    const res = await ocrInspection(file, projectId)
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
    <>
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={onBack} className="!px-3 !py-2 text-sm">
          <span aria-hidden="true">←</span> Assigned projects
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
            <span aria-hidden="true">↧</span> Print blank form
          </Button>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100/60">
            Project {projectId}
          </span>
        </div>
      </div>

      <Card className="border-dashed p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-400/10 text-lg" aria-hidden="true">⌁</span>
            <div>
              <p className="font-semibold text-white">Upload the filled document</p>
              <p className="mt-0.5 text-sm text-emerald-100/55">Optionally extract a PDF or image, then review every populated field.</p>
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:border-gold-400/50 hover:bg-gold-400/10 hover:text-gold-200">
            {ocrBusy ? 'Reading document…' : 'Upload & extract'}
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={ocrBusy} onChange={onFile} />
          </label>
        </div>
        {notice && <p className="mt-3 rounded-lg bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">{notice}</p>}
      </Card>

      {/* Editable draft */}
      {inspectionSections.map((section, sectionIndex) => {
        const sectionComplete = section.fields.filter((field) => data[field.key]?.trim()).length
        return (
        <Card key={section.title} className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-5 py-4 sm:px-7">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-xl">{section.icon}</span>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gold-300/70">Section {String(sectionIndex + 1).padStart(2, '0')}</p>
                <h2 className="mt-0.5 text-lg font-bold text-white">{section.title}</h2>
              </div>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              sectionComplete === section.fields.length
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                : 'border-white/10 bg-white/5 text-emerald-100/55'
            }`}>
              {sectionComplete === section.fields.length ? '✓ Complete' : `${sectionComplete} of ${section.fields.length}`}
            </span>
          </div>
          <div className="grid gap-x-5 gap-y-6 p-5 sm:grid-cols-2 sm:p-7">
            {section.fields.map((f, fieldIndex) => (
              <Fragment key={f.key}>
                {f.group && (fieldIndex === 0 || section.fields[fieldIndex - 1]?.group !== f.group) && (
                  <h3 className="border-b border-white/10 pb-2 text-sm font-bold uppercase tracking-[0.12em] text-gold-300 sm:col-span-2">{f.group}</h3>
                )}
              <div className={f.textarea ? 'sm:col-span-2' : ''}>
                <label htmlFor={`inspection-${f.key}`} className="mb-2 block text-sm font-semibold text-emerald-50">{f.label}</label>
                {f.textarea ? (
                  <textarea
                    id={`inspection-${f.key}`}
                    value={data[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={fieldHints[f.key] ?? `Enter ${f.label.toLowerCase()}`}
                    rows={4}
                    className="w-full resize-y rounded-xl border border-white/15 bg-black/15 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-emerald-100/25 hover:border-white/25 focus:border-gold-400/60 focus:bg-black/25 focus:ring-4 focus:ring-gold-400/10"
                  />
                ) : f.type === 'select' ? (
                  <select
                    id={`inspection-${f.key}`}
                    value={data[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-emerald-950 px-4 py-3 text-sm text-white outline-none transition hover:border-white/25 focus:border-gold-400/60 focus:ring-4 focus:ring-gold-400/10"
                  >
                    <option value="">Select…</option>
                    {f.options?.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : (
                  <input
                    id={`inspection-${f.key}`}
                    type={f.key === 'inspectionDate' ? 'date' : 'text'}
                    value={data[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    placeholder={fieldHints[f.key] ?? `Enter ${f.label.toLowerCase()}`}
                    className="w-full rounded-xl border border-white/15 bg-black/15 px-4 py-3 text-sm text-white outline-none transition placeholder:text-emerald-100/25 hover:border-white/25 focus:border-gold-400/60 focus:bg-black/25 focus:ring-4 focus:ring-gold-400/10"
                  />
                )}
              </div>
              </Fragment>
            ))}
          </div>
        </Card>
      )})}

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

      {error && <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-center text-sm text-red-200">{error}</p>}
      {saveMsg && (
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-center text-sm font-medium text-emerald-200">
          {saveMsg}
        </div>
      )}
      <Card className="sticky bottom-4 z-10 p-4 shadow-2xl shadow-black/30 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-white">Ready to save your inspection?</p>
            <p className="mt-1 text-sm text-emerald-100/55">
              {completion === 100 ? 'All fields are complete. Review once more before saving.' : `${totalFields - completedFields} fields are still empty. You can save and return later.`}
            </p>
          </div>
          <Button type="button" disabled={saving} onClick={handleSave} className="shrink-0 sm:min-w-56">
            {saving ? 'Saving…' : 'Save inspection'}
          </Button>
        </div>
      </Card>

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

    {createPortal(<article className="inspection-print-sheet" aria-hidden="true">
      <header className="inspection-print-header">
        <div>
          <p className="inspection-print-kicker">CODEHUB · Land Valuation System</p>
          <h1>LAND SITE INSPECTION &amp; VALUATION FORM</h1>
          <p>Complete clearly in blue or black ink.</p>
        </div>
        <div className="inspection-print-project">
          <span>Project ID</span>
          <strong>{projectId || '________________'}</strong>
        </div>
      </header>

      <div className="inspection-print-meta">
        <div><span>Inspection date</span><i /></div>
        <div><span>Technical officer</span><i /></div>
        <div><span>Contact number</span><i /></div>
      </div>

      <div className="inspection-print-instructions">
        <strong>How to complete this form for accurate scanning</strong>
        <p>Write in dark blue or black ink using CAPITAL letters. Write answers below each printed label, keep each answer on one line where possible, and do not cover or alter the labels.</p>
      </div>

      {printableInspectionSections.map((section, sectionIndex) => (
        <section className={`inspection-print-section${section.fields.some((field) => field.group) ? ' inspection-print-section-long' : ''}`} key={`print-${section.title}`}>
          <h2><b>{sectionIndex + 1}</b>{section.title}</h2>
          <div className="inspection-print-fields">
            {section.fields.map((field, fieldIndex) => (
              <Fragment key={`print-${field.key}`}>
              {field.group && (fieldIndex === 0 || section.fields[fieldIndex - 1]?.group !== field.group) && (
                <h3 className="inspection-print-group">{field.group}</h3>
              )}
              <div className={field.textarea ? 'inspection-print-field inspection-print-field-wide' : 'inspection-print-field'}>
                <label>{field.label}</label>
                {field.type === 'select' ? (
                  <div className="inspection-print-choice-answer">
                    <p>Write one: {field.options?.join(' / ')}</p>
                    <i />
                  </div>
                ) : (
                  <div className={field.textarea ? 'inspection-writing-lines inspection-writing-lines-tall' : 'inspection-writing-lines'}>
                    <i /><i /><i />
                  </div>
                )}
              </div>
              </Fragment>
            ))}
          </div>
        </section>
      ))}

      <footer className="inspection-print-footer">
        <div><span>Technical Officer’s signature</span><i /></div>
        <div><span>Date</span><i /></div>
        <p>I certify that the information recorded above reflects my observations made during the site inspection.</p>
      </footer>
    </article>, document.body)}
    </>
  )
}

export default InspectionForm
