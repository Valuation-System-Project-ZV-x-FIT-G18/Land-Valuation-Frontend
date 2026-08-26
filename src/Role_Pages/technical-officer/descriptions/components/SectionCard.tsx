//04
import { useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Input from '@/Common_Pages/components/ui/Input'
import type { SourceField } from '@/Role_Pages/technical-officer/descriptions/api/descriptions'

type Props = {
  label: string
  text: string
  onTextChange: (value: string) => void
  fields: SourceField[] // editable sources (empty for the image section)
  photos?: string[] // read-only photo list (image section only)
  onFieldChange: (key: string, value: string) => void
  onRegenerate: () => void
  busy: boolean
  onNavigate?: () => void
}

// One report section: its generated text, the sources that feed it, and a
// per-section Regenerate button. Sources can be edited before regenerating.
const SectionCard = ({ label, text, onTextChange, fields, photos, onFieldChange, onRegenerate, busy, onNavigate }: Props) => {
  const [showSources, setShowSources] = useState(false)

  return (
    <div onFocusCapture={onNavigate} onMouseDown={onNavigate}>
    <Card className="p-5 sm:p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{label}</h3>
        <Button type="button" variant="outline" size="sm" loading={busy} onClick={onRegenerate}>
          {busy ? 'Generating…' : '↻ Regenerate'}
        </Button>
      </div>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        rows={photos ? 5 : 4}
        placeholder="Click Regenerate to draft this section…"
        className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-accent-400/60 focus:ring-2 focus:ring-accent-400/30"
      />

      <button
        type="button"
        onClick={() => setShowSources((v) => !v)}
        className="mt-3 text-xs font-medium text-accent-300 hover:text-accent-200"
      >
        {showSources ? '▾' : '▸'} Sources used {photos ? `(${photos.length} photo${photos.length === 1 ? '' : 's'})` : `(${fields.length})`}
      </button>

      {showSources && (
        <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
          {photos ? (
            photos.length === 0 ? (
              <p className="text-xs text-emerald-100">No site photos uploaded for this project.</p>
            ) : (
              <ul className="list-inside list-disc text-xs text-emerald-100">
                {photos.map((p, i) => (
                  <li key={`${p}-${i}`}>{p}</li>
                ))}
              </ul>
            )
          ) : (
            <>
              <p className="text-[11px] text-emerald-100">
                Edit any value below, then click Regenerate to rebuild this section from it.
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {fields.map((f) => (
                  <label key={f.key} className="block">
                    <span className="mb-1 block text-[11px] font-medium text-emerald-100">{f.label}</span>
                    <Input
                      sizeVariant="sm"
                      aria-label={f.label}
                      value={f.value}
                      onChange={(e) => onFieldChange(f.key, e.target.value)}
                    />
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </Card>
    </div>
  )
}

export default SectionCard
