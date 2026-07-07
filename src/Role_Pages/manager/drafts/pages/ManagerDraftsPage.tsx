import { useCallback, useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import ManagerReportView from '@/Role_Pages/manager/drafts/components/ManagerReportView'
import { getAllProjects, STATUS_LABEL, type ManagerProject } from '@/Role_Pages/manager/drafts/api/manager-drafts'

// Manager > Check Drafts (view='check') or Corrections (view='corrections').
//  check       — drafts newly arrived at this level to review.
//  corrections — drafts sent BACK to this level to fix (mistakes).
const ManagerDraftsPage = ({ view = 'check' }: { view?: 'check' | 'corrections' | 'final' }) => {
  const { user } = useAuth()
  const level: 'L1' | 'L2' | 'L3' =
    user?.role === 'Manager L1' ? 'L1' : user?.role === 'Manager L2' ? 'L2' : 'L3'
  const isFinal = view === 'final'
  const isCorr = view === 'corrections'

  const [projects, setProjects] = useState<ManagerProject[]>([])
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<ManagerProject | null>(null)
  const [valuationId, setValuationId] = useState<number | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    getAllProjects(level, view).then((p) => { setProjects(p); setLoading(false) })
  }, [level, view])

  useEffect(() => { load() }, [load])

  const card = 'group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-gold-400/40 hover:bg-white/10'
  const chip = 'shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-emerald-100/80 transition group-hover:border-gold-400/50 group-hover:text-gold-200'
  const badge = (status: string) => {
    const c = status.startsWith('rejected') ? 'border-amber-400/40 bg-amber-400/10 text-amber-200'
      : status === 'locked' ? 'border-gold-400/50 bg-gold-400/10 text-gold-200'
      : status.startsWith('pending') ? 'border-sky-400/40 bg-sky-400/10 text-sky-200'
      : 'border-white/15 bg-white/5 text-emerald-100/70'
    return <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${c}`}>{STATUS_LABEL[status] ?? status}</span>
  }

  // Level 3 — the report for the chosen valuation.
  if (project && valuationId !== null) {
    return (
      <ManagerReportView
        projectId={project.projectId}
        valuationId={valuationId}
        level={level}
        reviewStatus={project.reviewStatus}
        rejectReason={project.rejectReason}
        onBack={() => setValuationId(null)}
        onDone={() => { setValuationId(null); setProject(null); load() }}
      />
    )
  }

  // Level 2 — the valuations inside the chosen project.
  if (project) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Button type="button" variant="outline" onClick={() => setProject(null)} className="!px-5 !py-2 text-sm">← All projects</Button>
        <Card className="p-4">
          <p className="flex items-center gap-2 font-semibold text-gold-300">{project.projectId} {badge(project.reviewStatus)}</p>
          <p className="text-sm text-emerald-100/80">{project.ownerName} · {project.location || '—'}</p>
        </Card>
        {project.valuations.map((v) => (
          <button key={v.valuationId} type="button" onClick={() => setValuationId(v.valuationId)} className={card}>
            <div className="min-w-0">
              <p className="font-semibold text-gold-300">Valuation #{v.valuationId}</p>
              <p className="mt-0.5 text-xs text-emerald-200/50">{v.status}{v.technicalOfficerId ? ` · ${v.technicalOfficerId}` : ''}</p>
            </div>
            <span className={chip}>View report →</span>
          </button>
        ))}
      </div>
    )
  }

  // Level 1 — all projects.
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          {isFinal ? <>Final <GradientText>Reports</GradientText></>
            : isCorr ? <>My <GradientText>Corrections</GradientText></>
            : <>Check <GradientText>Drafts</GradientText></>}
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          {isFinal
            ? 'Locked, finalised valuation reports. Open one to view or download it.'
            : isCorr
            ? 'Drafts a higher reviewer sent back for corrections. Fix them, then resubmit.'
            : level === 'L1'
              ? 'Drafts submitted by the L2 manager. Review, edit, then reject or lock the report.'
              : level === 'L2'
                ? 'Drafts submitted by L3. Review, edit, then reject to L3 or submit to L1.'
                : 'Drafts submitted by technical officers. Check, edit, then submit to L2.'}
        </p>
      </div>

      {loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading projects…</p>
      ) : projects.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold text-gold-200">{isFinal ? 'No final reports' : isCorr ? 'No corrections' : 'Nothing to review'}</p>
          <p className="mt-1 text-sm text-emerald-100/70">
            {isFinal ? 'Locked, finalised reports will appear here.'
              : isCorr ? 'Drafts sent back to you for fixing will appear here.'
              : 'Drafts waiting for your check will appear here.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <button key={p.projectId} type="button" onClick={() => setProject(p)} className={card}>
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-semibold text-gold-300">{p.projectId} {badge(p.reviewStatus)}</p>
                <p className="mt-0.5 truncate text-sm text-emerald-100/80">{p.ownerName} · {p.location || '—'}</p>
              </div>
              <span className={chip}>{p.valuations.length} valuation{p.valuations.length > 1 ? 's' : ''} →</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default ManagerDraftsPage
