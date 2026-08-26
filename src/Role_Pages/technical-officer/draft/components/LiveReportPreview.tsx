import { useEffect, useRef, useState } from 'react'

export type ReportNavigationTarget = { section: string; requestId: number }

type Props = {
  html: string
  loading: boolean
  savedDraft: boolean
  navigationTarget?: ReportNavigationTarget | null
  // The sheet is typed into directly. Every keystroke is reported so the owner
  // can treat the edited HTML as the new source of truth.
  editable?: boolean
  onHtmlChange?: (html: string) => void
  // Clicking a filled field reports which report field it was, so the form on
  // the left can jump to the input that produces it.
  onFieldPick?: (reportKey: string) => void
}

const LiveReportPreview = ({
  html, loading, savedDraft, navigationTarget, editable = false, onHtmlChange, onFieldPick,
}: Props) => {
  const viewportRef = useRef<HTMLDivElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)
  // The last HTML the sheet and the owner agree on. Writing innerHTML while the
  // officer is typing would move the caret and drop the keystroke, so the sheet
  // is only rewritten when the incoming HTML is genuinely different from what
  // is already on screen — including the text the officer just typed.
  const syncedHtmlRef = useRef<string | null>(null)
  const [scale, setScale] = useState(1)

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    const resize = () => setScale(Math.min(1, Math.max(0.35, (viewport.clientWidth - 32) / 794)))
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet || loading) return
    if (syncedHtmlRef.current === html) return
    syncedHtmlRef.current = html
    sheet.innerHTML = html
  }, [html, loading])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || !navigationTarget || loading) return
    const [kind, name] = navigationTarget.section.split(':', 2)
    const selector = kind === 'field'
      ? `[data-report-field="${name}"]`
      : `[data-report-section="${navigationTarget.section}"]`
    const target = viewport.querySelector<HTMLElement>(selector)
    if (!target) return

    const viewportRect = viewport.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    const nextTop = viewport.scrollTop + targetRect.top - viewportRect.top - Math.max(24, viewport.clientHeight * 0.2)
    viewport.scrollTo({ top: Math.max(0, nextTop), behavior: 'smooth' })
    target.style.outline = '2px solid rgba(30, 150, 200, 0.55)'
    target.style.backgroundColor = 'rgba(209, 250, 229, 0.35)'
    const timer = window.setTimeout(() => {
      target.style.outline = ''
      target.style.backgroundColor = ''
    }, 1600)
    return () => window.clearTimeout(timer)
  }, [loading, navigationTarget])

  const handleInput = () => {
    const sheet = sheetRef.current
    if (!sheet) return
    // Record what is on screen as already-synced, so the owner echoing this
    // HTML straight back does not trigger a rewrite mid-keystroke.
    syncedHtmlRef.current = sheet.innerHTML
    onHtmlChange?.(sheet.innerHTML)
  }

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!onFieldPick) return
    const field = (event.target as HTMLElement).closest('[data-report-field]')
    const key = field?.getAttribute('data-report-field')
    if (key) onFieldPick(key)
  }

  return (
  <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-200 shadow-card">
    <header className="border-b border-slate-300 bg-paper px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Live Draft Preview</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {savedDraft
              ? 'Showing the authoritative saved edited draft'
              : editable
                ? 'Type directly in the report, or click a value to jump to its field on the left'
                : 'Updates automatically from the inspection data'}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${savedDraft ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>
          {savedDraft ? 'Edited draft exists' : '● Live preview updated'}
        </span>
      </div>
      {/* Both marks are preview-only and never reach the exported PDF, so the
          legend has to live here rather than inside the report itself. */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#075fb8]" />
          Filled value — preview only
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[#fff3cd] ring-1 ring-amber-300" />
          Nothing entered yet
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded-sm bg-[rgba(30,150,200,0.14)] ring-1 ring-[rgba(30,150,200,0.55)]" />
          Standard wording — not written by you
        </span>
      </div>
    </header>
    <div ref={viewportRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
      {loading ? (
        <p className="py-20 text-center text-sm text-slate-600">Collecting the latest project information…</p>
      ) : (
        <div className="flex justify-center">
          <div
            ref={sheetRef}
            contentEditable={editable}
            suppressContentEditableWarning
            spellCheck={false}
            onInput={handleInput}
            onClick={handleClick}
            className={`min-h-[1120px] w-[794px] shrink-0 bg-paper p-[55px] text-black shadow-card outline-none ${savedDraft ? '' : 'draft-working-values'}`}
            style={{ zoom: scale }}
          />
        </div>
      )}
    </div>
  </section>
  )
}

export default LiveReportPreview
