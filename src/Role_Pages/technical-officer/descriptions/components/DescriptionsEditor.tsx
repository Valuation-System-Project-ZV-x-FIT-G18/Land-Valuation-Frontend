//02
import { useEffect, useState } from 'react'
import StepFooter from '@/Role_Pages/technical-officer/shared/StepFooter'
import BackButton from '@/Role_Pages/technical-officer/shared/BackButton'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SectionCard from './SectionCard'
import ValuationSection from './ValuationSection'
import EvidenceSection from './EvidenceSection'
import {
  getSources,
  getDescriptions,
  generateSection,
  generateAllSections,
  saveDescriptions,
  type Descriptions,
  type SectionKey,
  type SourceSection,
} from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

const empty: Descriptions = {
  requestDescription: '',
  limitations: '',
  generalAssumptions: '',
  situation: '',
  extentDescription: '',
  accessDescription: '',
  ownershipDescription: '',
  rentControlRegulation: '',
  certification: '',
  landDescription: '',
  localityDescription: '',
  localityFacilities: '',
  legalParagraph: '',
  localAuthorityTax: '',
  streetLineBuildingLimits: '',
  mandatoryRequirements: '',
  conclusion: '',
  valuation: '',
  evidence: '',
  imageAnalysis: '',
}

// Section order + labels (image section has no editable text fields, only photos).
const ORDER: { key: SectionKey; label: string }[] = [
  { key: 'requestDescription', label: 'Request Description' },
  { key: 'limitations', label: 'Limitations' },
  { key: 'generalAssumptions', label: 'General Assumptions' },
  { key: 'situation', label: 'Situation' },
  { key: 'extentDescription', label: 'Extent / Survey & Deed Particulars' },
  { key: 'accessDescription', label: 'Access and Nature of the Accessibility' },
  { key: 'landDescription', label: 'Description of the Land' },
  { key: 'ownershipDescription', label: 'Ownership' },
  { key: 'localAuthorityTax', label: 'Local Authority Tax' },
  { key: 'streetLineBuildingLimits', label: 'Street Line & Building Limits' },
  { key: 'mandatoryRequirements', label: 'Mandatory Requirements' },
  { key: 'rentControlRegulation', label: 'Rent Control Regulation' },
  { key: 'localityDescription', label: 'Locality' },
  { key: 'localityFacilities', label: 'Locality Facilities (Section 7)' },
  { key: 'conclusion', label: 'Valuation Conclusion (Section 12)' },
  { key: 'certification', label: 'Certification' },
]

const reportSection: Partial<Record<SectionKey, string>> = {
  requestDescription: 'property', limitations: 'property', generalAssumptions: 'property',
  situation: 'property', extentDescription: 'land', accessDescription: 'access', landDescription: 'land',
  ownershipDescription: 'legal', legalParagraph: 'legal', localAuthorityTax: 'legal',
  streetLineBuildingLimits: 'legal', mandatoryRequirements: 'legal', rentControlRegulation: 'legal',
  localityDescription: 'locality', localityFacilities: 'locality', conclusion: 'conclusion', certification: 'conclusion',
}

type Props = { projectId: string; onBack: () => void; onContinueToDraft?: () => void; onDataSaved?: () => void; onPreviewChange?: (values: Record<string, string>) => void; onReportNavigate?: (section: string) => void }

const DescriptionsEditor = ({ projectId, onBack, onContinueToDraft, onDataSaved, onPreviewChange, onReportNavigate }: Props) => {
  const [texts, setTexts] = useState<Descriptions>(empty)
  const [sources, setSources] = useState<SourceSection[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [busy, setBusy] = useState<SectionKey | 'all' | null>(null)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    onPreviewChange?.({
      requestDescription: texts.requestDescription,
      limitations: texts.limitations,
      generalAssumptions: texts.generalAssumptions,
      localityDescription: texts.situation || texts.localityDescription,
      extentDescription: texts.extentDescription,
      accessLocationDescription: texts.accessDescription,
      legalDescription: texts.legalParagraph || texts.ownershipDescription,
      localAuthorityTax: texts.localAuthorityTax,
      streetLineBuildingLimits: texts.streetLineBuildingLimits,
      mandatoryRequirements: texts.mandatoryRequirements,
      rentControlRegulation: texts.rentControlRegulation,
      localityFacilities: texts.localityFacilities || texts.localityDescription,
      certification: texts.certification,
      landDescription: texts.landDescription,
      conclusion: texts.conclusion,
      savedValuation: texts.valuation,
      savedEvidence: texts.evidence,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texts])

  // On open: load the editable sources + photos, and any previously saved text.
  useEffect(() => {
    getSources(projectId).then((s) => {
      if (s.error) setError(s.error)
      setSources(s.sources)
      setPhotos(s.photos)
    })
    getDescriptions(projectId).then((d) => {
      const written = d && ORDER.some(({ key }) => String(d[key] ?? '').trim())
      if (written) {
        const current = { ...empty }
        for (const { key } of ORDER) current[key] = d[key] ?? ''
        setTexts(current)
        return
      }
      // A new project must stay blank until the officer explicitly asks for
      // generation. Merely opening this step must never consume Gemini quota
      // or make template wording look like AI-generated content.
      setTexts({ ...empty })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  // Build the { key: value } dict for a section from its (edited) source fields.
  const fieldsOf = (section: SectionKey): Record<string, string> => {
    const sec = sources.find((s) => s.section === section)
    return Object.fromEntries((sec?.fields ?? []).map((f) => [f.key, f.value]))
  }

  const setField = (section: SectionKey, key: string, value: string) => {
    setSources((prev) =>
      prev.map((s) =>
        s.section === section ? { ...s, fields: s.fields.map((f) => (f.key === key ? { ...f, value } : f)) } : s,
      ),
    )
  }

  const regenerate = async (section: SectionKey) => {
    setBusy(section)
    setError('')
    setNotice('')
    const res = await generateSection(projectId, section, fieldsOf(section))
    setBusy(null)
    if (res.error) return setError(res.error)
    setTexts((t) => ({ ...t, [section]: res.text }))
    setNotice(res.aiUsed ? 'Regenerated with AI.' : 'Regenerated from the sources using the template fallback.')
  }

  // One backend request writes and saves every section. This used to fan out
  // into one AI call per section, which exceeded the free Gemini quota on a
  // single click and left most sections on template wording.
  const regenerateAll = async () => {
    setBusy('all')
    setError('')
    setNotice('')
    const res = await generateAllSections(projectId)
    setBusy(null)
    if (!res.ok || !res.data) {
      setError(res.error ?? 'Could not generate the sections.')
      return
    }

    const next = { ...empty }
    for (const { key } of ORDER) next[key] = res.data[key] ?? ''
    setTexts(next)
    onDataSaved?.() // the backend already saved them; refresh the report preview

    const ai = res.aiSections ?? 0
    const total = res.totalSections ?? ORDER.length
    setNotice(
      ai === 0
        ? 'Sections written from your data using the standard template — the AI service was unavailable. Review, edit, then save.'
        : ai < total
          ? `${ai} of ${total} sections written with AI; the rest used the standard template. Review, edit, then save.`
          : 'All sections generated with AI. Review, edit, then save.',
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const res = await saveDescriptions(projectId, texts)
    setSaving(false)
    if (res.ok) {
      setNotice('✓ Descriptions saved to the database.')
      onDataSaved?.()
      return true
    }
    setError(res.error ?? 'Could not save.')
    return false
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <BackButton onClick={onBack} />

      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Descriptions — <GradientText>{projectId}</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-emerald-100">
          Generate the descriptions from the saved project and inspection data. Each section lists
          its sources so you can correct a value and regenerate only that section.
        </p>
      </div>

      <div className="flex justify-center">
        <Button type="button" onClick={regenerateAll} loading={busy === 'all'} disabled={busy !== null}>
          {busy === 'all' ? 'Generating descriptions…' : 'Generate descriptions'}
        </Button>
      </div>

      {(busy === 'all' || notice || error) && (
        <Card className="p-4 text-center">
          {busy === 'all' && (
            <p className="flex items-center justify-center gap-2 text-sm text-emerald-100">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200/30 border-t-accent-300" />
              Writing the report sections…
            </p>
          )}
          {notice && !busy && (
            <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">{notice}</p>
          )}
          {error && !busy && (
            <p className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">{error}</p>
          )}
        </Card>
      )}

      {ORDER.map(({ key, label }) => {
        const isImage = key === 'imageAnalysis'
        return (
          <SectionCard
            key={key}
            label={label}
            text={texts[key] ?? ''}
            onTextChange={(v) => {
              setTexts((t) => ({ ...t, [key]: v }))
            }}
            fields={isImage ? [] : (sources.find((s) => s.section === key)?.fields ?? [])}
            photos={isImage ? photos : undefined}
            onFieldChange={(fk, v) => setField(key, fk, v)}
            onRegenerate={() => regenerate(key)}
            busy={busy === key || busy === 'all'}
            onNavigate={() => onReportNavigate?.(reportSection[key] ?? 'property')}
          />
        )
      })}

      {/* Section 9 — evidence (from nearby analysis) and Section 11 — valuation table */}
      {false && <EvidenceSection
        projectId={projectId}
        value={texts.evidence ?? ''}
        onChange={(v) => setTexts((t) => ({ ...t, evidence: v }))}
      />}
      {false && <ValuationSection
        projectId={projectId}
        value={texts.valuation ?? ''}
        onChange={(v) => setTexts((t) => ({ ...t, valuation: v }))}
      />}

      <StepFooter
        current="descriptions"
        nextDisabled={busy !== null}
        hint="Wait for the current generation to finish."
        onNext={onContinueToDraft}
        onSave={handleSave}
        saving={saving}
      />

    </div>
  )
}

export default DescriptionsEditor
