import { Fragment, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'
import StepFooter from '@/Role_Pages/technical-officer/shared/StepFooter'
import BackButton from '@/Role_Pages/technical-officer/shared/BackButton'
import { createPortal } from 'react-dom'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import { inspectionSections, type InspSection } from '@/Role_Pages/technical-officer/inspections/constants/inspectionFields'
import { sampleInspection } from '@/Role_Pages/technical-officer/inspections/constants/sampleInspection'
import {
  ocrInspection,
  getInspection,
  saveInspection,
  type InspectionData,
} from '@/Role_Pages/technical-officer/inspections/api/inspections'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

type InspectionFormProps = {
  projectId: string
  toId: string
  assignment?: Assignment
  onBack: () => void
  compact?: boolean
  autoSave?: boolean
  promptAfterSave?: boolean
  value?: InspectionData
  onChange?: Dispatch<SetStateAction<InspectionData>>
  onSaved?: () => void
  onFieldFocus?: (fieldName: string) => void
  // A field picked in the report on the right. The timestamp makes picking the
  // same field twice a new request rather than a no-op.
  focusField?: { key: string; requestId: number } | null
  // Run after a successful save, before the step moves on. The inspection step
  // uses it to write the report's narrative sections from what was just saved.
  afterSave?: () => Promise<void> | void
}

const printableInspectionSections: InspSection[] = [
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

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'failed'

const InspectionForm = ({ projectId, toId, assignment, onBack, compact = false, autoSave = false, promptAfterSave = false, value, onChange, onSaved, onFieldFocus, focusField, afterSave }: InspectionFormProps) => {
  const [internalData, setInternalData] = useState<InspectionData>({})
  const data = value ?? internalData
  const setData = onChange ?? setInternalData
  const [ocrBusy, setOcrBusy] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [saveMsg, setSaveMsg] = useState('')
  const [error, setError] = useState('')
  const [rawText, setRawText] = useState('')
  // Which values OCR put there and the officer has not looked at yet. The page
  // asks them to "verify every populated field", which is impossible advice
  // when an extracted value and a typed one look identical - with 40+ fields
  // they either trust all of it or re-check all of it.
  const [unverifiedOcr, setUnverifiedOcr] = useState<Set<string>>(new Set())

  const markVerified = (key: string) =>
    setUnverifiedOcr((current) => {
      if (!current.has(key)) return current
      const next = new Set(current)
      next.delete(key)
      return next
    })
  const [openSection, setOpenSection] = useState(0)
  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>('idle')
  const fileRef = useRef<HTMLInputElement>(null)
  const hydratedRef = useRef(false)
  const lastSavedRef = useRef('')
  const localDraftKey = `inspection-working-copy:${toId}:${projectId}`

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
    hydratedRef.current = false
    setAutoSaveStatus('idle')
    getInspection(projectId).then((saved) => {
      const serverData = saved ?? {}
      lastSavedRef.current = JSON.stringify(serverData)
      let initial = serverData
      try {
        const local = JSON.parse(localStorage.getItem(localDraftKey) ?? 'null') as { data?: InspectionData; savedAt?: string } | null
        if (local?.data && JSON.stringify(local.data) !== lastSavedRef.current) {
          initial = local.data
          setNotice(`Unsaved inspection work was restored${local.savedAt ? ` from ${new Date(local.savedAt).toLocaleString()}` : ''}.`)
        }
      } catch {
        localStorage.removeItem(localDraftKey)
      }
      if (Object.keys(initial).length) setData(initial)
      hydratedRef.current = true
    })
  }, [localDraftKey, projectId])

  // Keep only changes that have not reached the database. A short debounce
  // avoids synchronous storage writes for every keystroke while still making
  // refreshes and temporary network loss safe.
  useEffect(() => {
    if (!hydratedRef.current) return
    const serialized = JSON.stringify(data)
    if (serialized === lastSavedRef.current) return
    const timer = window.setTimeout(() => {
      try {
        localStorage.setItem(localDraftKey, JSON.stringify({ data, savedAt: new Date().toISOString() }))
      } catch {
        // Database save remains available when browser storage is unavailable.
      }
    }, 400)
    return () => window.clearTimeout(timer)
  }, [data, localDraftKey])

  // The preview reads from React state immediately. Persistence is deliberately
  // separate and debounced so typing never creates one request per character.
  useEffect(() => {
    if (!autoSave || !hydratedRef.current || unverifiedOcr.size > 0) return
    const serialized = JSON.stringify(data)
    if (serialized === lastSavedRef.current) return

    setAutoSaveStatus('idle')
    const timer = window.setTimeout(async () => {
      setAutoSaveStatus('saving')
      const result = await saveInspection(projectId, toId, data)
      if (result.ok) {
        lastSavedRef.current = serialized
        localStorage.removeItem(localDraftKey)
        setAutoSaveStatus('saved')
        onSaved?.()
      } else {
        setAutoSaveStatus('failed')
      }
    }, 1500)

    return () => window.clearTimeout(timer)
  }, [autoSave, data, onSaved, projectId, toId, unverifiedOcr])

  // Jump to the input behind a value clicked in the report. In compact mode the
  // sections are collapsed, so the right one is opened first and the scroll is
  // deferred a frame until that section has actually rendered.
  useEffect(() => {
    if (!focusField?.key) return
    const sectionIndex = inspectionSections.findIndex(
      (section) => section.fields.some((field) => field.key === focusField.key),
    )
    if (sectionIndex === -1) return
    setOpenSection(sectionIndex)

    const frame = window.requestAnimationFrame(() => {
      const input = document.getElementById(`inspection-${focusField.key}`)
      if (!input) return
      input.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Deliberately NOT focused. This runs from a click inside the report, and
      // taking focus would pull the caret out of the sheet the officer just
      // clicked into — making the report impossible to type in. A highlight
      // shows which input it is without stealing the caret.
      input.classList.add('ring-2', 'ring-accent-400/70')
      window.setTimeout(() => input.classList.remove('ring-2', 'ring-accent-400/70'), 1600)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [focusField?.key, focusField?.requestId])

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
    const extractedKeys = Object.keys(res.fields)
    if (extractedKeys.length > 0) {
      const populatedKeys = extractedKeys.filter((key) => res.fields[key]?.trim() && !data[key]?.trim())
      const skipped = extractedKeys.length - populatedKeys.length
      setData((current) => ({
        ...current,
        ...Object.fromEntries(populatedKeys.map((key) => [key, res.fields[key]])),
      }))
      setUnverifiedOcr(new Set(populatedKeys))
      setNotice(
        `OCR extraction completed. ${populatedKeys.length} empty field(s) were populated and marked for review.` +
        (skipped ? ` ${skipped} existing value(s) were kept unchanged.` : ''),
      )
    } else {
      setError(
        res.ocrError
          ? `OCR extraction failed (${res.ocrError}). You can continue by entering the information manually.`
          : 'OCR extraction failed to find matching fields. You can continue by entering the information manually.',
      )
    }
  }

  // Testing aid: fill the whole form with a plausible inspection so the rest of
  // the workflow can be exercised without typing forty-odd fields each time.
  // It clears any OCR marks because none of these values came from a document.
  const fillSample = () => {
    setData((current) => ({ ...current, ...sampleInspection }))
    setUnverifiedOcr(new Set())
    setNotice('Sample inspection data filled in. Replace it with the real findings before submitting.')
  }

  const handleSave = async () => {
    if (unverifiedOcr.size > 0) {
      const firstKey = Array.from(unverifiedOcr)[0]
      const sectionIndex = inspectionSections.findIndex((section) => section.fields.some((field) => field.key === firstKey))
      if (sectionIndex >= 0) setOpenSection(sectionIndex)
      setError(`Review the ${unverifiedOcr.size} OCR-populated field${unverifiedOcr.size === 1 ? '' : 's'} marked in amber before saving.`)
      window.requestAnimationFrame(() => document.getElementById(`inspection-${firstKey}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }))
      return false
    }
    setSaving(true)
    setError('')
    setSaveMsg('')
    const res = await saveInspection(projectId, toId, data)
    setSaving(false)
    if (res.ok) {
      lastSavedRef.current = JSON.stringify(data)
      localStorage.removeItem(localDraftKey)
      onSaved?.()
      if (afterSave) {
        // Writing the report sections is a second, slower round trip, so the
        // save is confirmed first rather than leaving the button silent.
        setSaving(true)
        setSaveMsg('Inspection saved. Writing the report sections…')
        try {
          await afterSave()
        } finally {
          setSaving(false)
        }
      }
      setSaveMsg('Inspection saved to the database.')
      return true
    }
    setError(res.error ?? 'Could not save. Is the server running?')
    return false
  }

  return (
    <>
    <div className={compact ? 'space-y-4' : 'mx-auto max-w-6xl space-y-6 pb-10'}>
      {!compact && <div className="flex flex-wrap items-center justify-between gap-3">
        <BackButton onClick={onBack} />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => window.print()}>
            Print blank form
          </Button>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100">
            Project {projectId}
          </span>
        </div>
      </div>}

      <Card className="border-dashed p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div>
              <p className="font-semibold text-white">Upload the filled document</p>
              <p className="mt-0.5 text-sm text-emerald-100">Upload an inspection form to extract data, then verify every populated field.</p>
            </div>
          </div>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-emerald-50 transition hover:border-accent-400/50 hover:bg-accent-400/10 hover:text-accent-200">
            {ocrBusy ? 'Extracting inspection data…' : 'Upload & extract'}
            <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" disabled={ocrBusy} onChange={onFile} />
          </label>
        </div>
        {notice && <p className="mt-3 rounded-lg bg-emerald-400/10 px-3 py-2 text-sm text-emerald-200">{notice}</p>}
        {/* Development builds only. `import.meta.env.DEV` is replaced with a
            literal false when Vite builds for production, so this block — and
            the sample data it imports — is dropped from the shipped bundle
            entirely. Invented findings can never reach a real report. */}
        {import.meta.env.DEV && (
          <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-amber-400/40 bg-amber-400/5 px-3 py-2">
            <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-200">
              Dev only
            </span>
            <span className="text-xs text-amber-100">Fill every field with a sample inspection for testing.</span>
            <Button type="button" size="sm" variant="outline" className="ml-auto" onClick={fillSample}>
              Fill sample data
            </Button>
          </div>
        )}
      </Card>

      {compact && (
        <div className="rounded-xl border border-white/10 bg-black/10 px-4 py-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold uppercase tracking-[0.14em] text-emerald-100">Inspection progress</span>
            <div className="flex items-center gap-3">
              {autoSave && <span className={`font-semibold ${
                autoSaveStatus === 'failed' ? 'text-red-300' :
                autoSaveStatus === 'saving' ? 'text-accent-200' :
                autoSaveStatus === 'saved' ? 'text-emerald-300' : 'text-emerald-100'
              }`} aria-live="polite">
                {autoSaveStatus === 'saving' ? 'Saving…' : autoSaveStatus === 'saved' ? 'Saved' : autoSaveStatus === 'failed' ? 'Save failed' : 'Autosave ready'}
              </span>}
              <span className="font-bold text-accent-200">{completedFields} / {totalFields}</span>
            </div>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-accent-400 transition-[width] duration-300" style={{ width: `${completion}%` }} />
          </div>
          {/* Turns "verify everything" into a countable job. */}
          {unverifiedOcr.size > 0 && (
            <p className="mt-2 text-xs font-medium text-amber-200">
              {unverifiedOcr.size} extracted value{unverifiedOcr.size === 1 ? '' : 's'} still to check —
              marked in amber below. Opening a field clears its mark.
            </p>
          )}
        </div>
      )}

      {/* Editable draft */}
      {inspectionSections.map((section, sectionIndex) => {
        const sectionComplete = section.fields.filter((field) => data[field.key]?.trim()).length
        return (
        <Card key={section.title} className="overflow-hidden">
          <button type="button" disabled={!compact} aria-expanded={!compact || openSection === sectionIndex} onClick={() => compact && setOpenSection((current) => current === sectionIndex ? -1 : sectionIndex)} className={`flex w-full flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.025] px-5 py-4 text-left sm:px-7 ${compact ? 'cursor-pointer transition hover:bg-white/[0.055]' : 'cursor-default'}`}>
            <div className="flex items-center gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-300">Section {String(sectionIndex + 1).padStart(2, '0')}</p>
                <h2 className="mt-0.5 text-lg font-bold text-white">{section.title}</h2>
              </div>
            </div>
            <span className="flex items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${
              sectionComplete === section.fields.length
                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200'
                : 'border-white/10 bg-white/5 text-emerald-100'
            }`}>
              {sectionComplete === section.fields.length ? '✓ Complete' : `${sectionComplete} of ${section.fields.length}`}
            </span>
              {compact && <span className={`text-emerald-100 transition-transform ${openSection === sectionIndex ? 'rotate-180' : ''}`} aria-hidden="true">⌄</span>}
            </span>
          </button>
          {(!compact || openSection === sectionIndex) && <div className={`grid gap-x-5 gap-y-5 p-5 ${compact ? 'bg-black/[0.06]' : 'sm:grid-cols-2 sm:p-7'}`}>
            {section.fields.map((f, fieldIndex) => (
              <Fragment key={f.key}>
                {f.group && (fieldIndex === 0 || section.fields[fieldIndex - 1]?.group !== f.group) && (
                  <h3 className={`border-b border-white/10 pb-2 text-sm font-bold uppercase tracking-[0.12em] text-accent-300 ${compact ? '' : 'sm:col-span-2'}`}>{f.group}</h3>
                )}
              <div className={f.textarea && !compact ? 'sm:col-span-2' : ''}>
                <label htmlFor={`inspection-${f.key}`} className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold text-emerald-50">
                  {f.label}
                  {unverifiedOcr.has(f.key) && (
                    <span className="rounded-full border border-amber-400/40 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                      From OCR — check
                    </span>
                  )}
                </label>
                {f.textarea ? (
                  <textarea
                    id={`inspection-${f.key}`}
                    value={data[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    onFocus={() => { onFieldFocus?.(f.key); markVerified(f.key) }}
                    placeholder={fieldHints[f.key] ?? `Enter ${f.label.toLowerCase()}`}
                    rows={4}
                    className={`w-full resize-y rounded-xl border bg-black/15 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:italic placeholder:text-emerald-200/45 hover:border-white/25 focus:border-accent-400/60 focus:bg-black/25 focus:ring-4 focus:ring-accent-400/10 ${unverifiedOcr.has(f.key) ? 'border-amber-400/70' : 'border-white/15'}`}
                  />
                ) : f.type === 'select' ? (
                  <select
                    id={`inspection-${f.key}`}
                    value={data[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                    onFocus={() => { onFieldFocus?.(f.key); markVerified(f.key) }}
                    className={`w-full rounded-xl border bg-surface px-4 py-3 text-sm text-white outline-none transition hover:border-white/25 focus:border-accent-400/60 focus:ring-4 focus:ring-accent-400/10 ${unverifiedOcr.has(f.key) ? 'border-amber-400/70' : 'border-white/15'}`}
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
                    onFocus={() => { onFieldFocus?.(f.key); markVerified(f.key) }}
                    placeholder={fieldHints[f.key] ?? `Enter ${f.label.toLowerCase()}`}
                    className={`w-full rounded-xl border bg-black/15 px-4 py-3 text-sm text-white outline-none transition placeholder:italic placeholder:text-emerald-200/45 hover:border-white/25 focus:border-accent-400/60 focus:bg-black/25 focus:ring-4 focus:ring-accent-400/10 ${unverifiedOcr.has(f.key) ? 'border-amber-400/70' : 'border-white/15'}`}
                  />
                )}
              </div>
              </Fragment>
            ))}
          </div>}
        </Card>
      )})}

      {/* Raw OCR text (reference) */}
      {rawText && (
        <details className="rounded-xl border border-white/10 bg-white/5 p-4">
          <summary className="cursor-pointer text-sm font-medium text-emerald-200">
            Raw OCR text (for reference)
          </summary>
          <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap text-xs text-emerald-100">
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
      <Card className={`${compact ? '' : 'sticky bottom-4 z-10 shadow-card shadow-black/30'} p-4 sm:p-5`}>
        <div>
          <p className="font-semibold text-white">Ready to save your inspection?</p>
          <p className="mt-1 text-sm text-emerald-100">
            {completion === 100 ? 'All fields are complete. Review once more before saving.' : `${totalFields - completedFields} fields are still empty. You can save and return later.`}
          </p>
        </div>
        {/* This same form is also the left pane of the Create Draft step, where
            "Next: Site Photos" would send the officer backwards. It only closes
            the Inspection step when it is standalone or explicitly told it is. */}
        {(!compact || promptAfterSave) ? (
          <StepFooter
            current="inspection"
            nextState={{ projectId, valuationId: assignment?.valuationId ?? null }}
            onSave={handleSave}
            saving={saving}
          />
        ) : (
          <div className="mt-4">
            <Button type="button" size="sm" disabled={saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save inspection'}
            </Button>
          </div>
        )}
      </Card>

      {/* The "continue to Site Photos?" popup used to appear here. The step
          footer above offers the same move without interrupting the save. */}
    </div>

    {!compact && createPortal(<article className="inspection-print-sheet" aria-hidden="true">
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
        <section className={`inspection-print-section${section.fields.some((field) => field.group) ? ' inspection-print-section-long' : ''}${sectionIndex === 2 || sectionIndex === 4 ? ' inspection-print-page-break' : ''}`} key={`print-${section.title}`}>
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
