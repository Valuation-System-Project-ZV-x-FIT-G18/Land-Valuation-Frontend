import { useEffect, useRef, useState } from 'react'
import ReportReadiness from '@/Role_Pages/technical-officer/draft/components/ReportReadiness'

type Props = {
  html: string
  loading: boolean
  savedDraft: boolean
  readiness: { label: string; ready: boolean }[]
}

const LiveReportPreview = ({ html, loading, savedDraft, readiness }: Props) => {
  const viewportRef = useRef<HTMLDivElement>(null)
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

  return (
  <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/10 bg-slate-200 shadow-2xl">
    <header className="border-b border-slate-300 bg-white px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Live Draft Preview</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {savedDraft ? 'Showing the authoritative saved edited draft' : 'Updates automatically from the inspection data'}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${savedDraft ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>
          {savedDraft ? 'Edited draft exists' : '● Live preview updated'}
        </span>
      </div>
      <div className="mt-3"><ReportReadiness items={readiness} /></div>
    </header>
    <div ref={viewportRef} className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-4">
      {loading ? (
        <p className="py-20 text-center text-sm text-slate-600">Collecting the latest project information…</p>
      ) : (
        <div className="flex justify-center">
          <div
            className="min-h-[1120px] w-[794px] shrink-0 bg-white p-[55px] text-black shadow-xl"
            style={{ zoom: scale }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      )}
    </div>
  </section>
  )
}

export default LiveReportPreview
