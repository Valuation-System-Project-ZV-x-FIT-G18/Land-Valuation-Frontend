import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import SectionCard from './SectionCard'
import ValuationSection from './ValuationSection'
import EvidenceSection from './EvidenceSection'
import NextStepModal from '@/Role_Pages/technical-officer/shared/NextStepModal'
import {
  getSources,
  getDescriptions,
  generateSection,
  saveDescriptions,
  type Descriptions,
  type SectionKey,
  type SourceSection,
} from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

const empty: Descriptions = {
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
  { key: 'landDescription', label: 'Land Description' },
  { key: 'localityDescription', label: 'Locality Description (Section 7)' },
  { key: 'localityFacilities', label: 'Locality Facilities' },
  { key: 'legalParagraph', label: 'Legal Paragraph' },
  { key: 'localAuthorityTax', label: 'Local Authority Tax' },
  { key: 'streetLineBuildingLimits', label: 'Street Line & Building Limits' },
  { key: 'mandatoryRequirements', label: 'Mandatory Requirements & Planning Regulations' },
  { key: 'conclusion', label: 'Conclusion' },
  { key: 'imageAnalysis', label: 'Image Analysis (site photos)' },
]

type Props = { projectId: string; onBack: () => void }

const DescriptionsEditor = ({ projectId, onBack }: Props) => {
  const [texts, setTexts] = useState<Descriptions>(empty)
  const [sources, setSources] = useState<SourceSection[]>([])
  const [photos, setPhotos] = useState<string[]>([])
  const [busy, setBusy] = useState<SectionKey | 'all' | null>(null)
  const [saving, setSaving] = useState(false)
  const [goNext, setGoNext] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  // On open: load the editable sources + photos, and any previously saved text.
  useEffect(() => {
    getSources(projectId).then((s) => {
      if (s.error) setError(s.error)
      setSources(s.sources)
      setPhotos(s.photos)
    })
    getDescriptions(projectId).then((d) => d && setTexts(d))
  }, [projectId])

  // Build the { key: value } dict for a section from its (edited) source fields.
  const fieldsOf = (section: SectionKey): Record<string, string> => {
    const sec = sources.find((s) => s.section === section)
    return Object.fromEntries((sec?.fields ?? []).map((f) => [f.key, f.value]))
  }

  const setField = (section: SectionKey, key: string, value: string) =>
    setSources((prev) =>
      prev.map((s) =>
        s.section === section ? { ...s, fields: s.fields.map((f) => (f.key === key ? { ...f, value } : f)) } : s,
      ),
    )

  const regenerate = async (section: SectionKey) => {
    setBusy(section)
    setError('')
    setNotice('')
    const res = await generateSection(projectId, section, fieldsOf(section))
    setBusy(null)
    if (res.error) return setError(res.error)
    setTexts((t) => ({ ...t, [section]: res.text }))
    setNotice(res.aiUsed ? '✨ Regenerated with AI.' : 'Regenerated from the sources (AI key not configured).')
  }

  const regenerateAll = async () => {
    setBusy('all')
    setError('')
    setNotice('')
    let aiUsed = false
    const next = { ...texts }
    for (const { key } of ORDER) {
      const res = await generateSection(projectId, key, fieldsOf(key))
      if (res.error) {
        setBusy(null)
        return setError(res.error)
      }
      next[key] = res.text
      aiUsed = aiUsed || res.aiUsed
    }
    setTexts(next)
    setBusy(null)
    setNotice(aiUsed ? '✨ All sections generated with AI. Review, edit, then save.' : 'All sections generated from your data. Review, edit, then save.')
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const res = await saveDescriptions(projectId, texts)
    setSaving(false)
    if (res.ok) {
      setNotice('✓ Descriptions saved to the database.')
      setGoNext(true)
    } else {
      setError(res.error ?? 'Could not save.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Button type="button" variant="ghost" size="sm" onClick={onBack}>
        ← Back to projects
      </Button>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Descriptions — <GradientText>{projectId}</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-emerald-100/70">
          Each section lists the sources it was built from. Edit any source and regenerate that
          section, or generate them all at once — then edit the draft and save.
        </p>
      </div>

      <Card className="p-6 text-center">
        <Button type="button" loading={busy === 'all'} disabled={busy !== null} onClick={regenerateAll}>
          {busy === 'all' ? 'Generating…' : '✨ Generate all sections'}
        </Button>
        {notice && (
          <p className="mt-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-200">{notice}</p>
        )}
        {error && (
          <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-2.5 text-sm text-amber-300">{error}</p>
        )}
      </Card>

      {ORDER.map(({ key, label }) => {
        const isImage = key === 'imageAnalysis'
        return (
          <SectionCard
            key={key}
            label={label}
            text={texts[key] ?? ''}
            onTextChange={(v) => setTexts((t) => ({ ...t, [key]: v }))}
            fields={isImage ? [] : (sources.find((s) => s.section === key)?.fields ?? [])}
            photos={isImage ? photos : undefined}
            onFieldChange={(fk, v) => setField(key, fk, v)}
            onRegenerate={() => regenerate(key)}
            busy={busy === key || busy === 'all'}
          />
        )
      })}

      {/* Section 9 — evidence (from nearby analysis) and Section 11 — valuation table */}
      <EvidenceSection
        projectId={projectId}
        value={texts.evidence ?? ''}
        onChange={(v) => setTexts((t) => ({ ...t, evidence: v }))}
      />
      <ValuationSection
        projectId={projectId}
        value={texts.valuation ?? ''}
        onChange={(v) => setTexts((t) => ({ ...t, valuation: v }))}
      />

      <Button type="button" fullWidth variant="success" loading={saving} disabled={busy !== null} onClick={handleSave}>
        {saving ? 'Saving…' : 'OK — Save Descriptions'}
      </Button>

      <NextStepModal
        open={goNext}
        onClose={() => setGoNext(false)}
        nextLabel="Create Draft"
        nextTo="/technical-officer/draft"
        projectId={projectId}
        message="Descriptions saved."
      />
    </div>
  )
}

export default DescriptionsEditor
