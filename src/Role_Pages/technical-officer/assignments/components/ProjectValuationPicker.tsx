import { useEffect, useMemo, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import { getAssignments, type Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

// Two-level picker used by every Technical Officer page: first the list of
// PROJECTS; click a project to see the VALUATIONS inside it; click a valuation
// to open the work. This keeps the project→valuation hierarchy consistent.
type Props = {
  toId: string
  actionLabel?: string
  onSelect: (a: Assignment) => void
  completed?: string[] // project ids to badge as "✓ Saved"
  statusFilter?: (a: Assignment) => boolean // keep only matching valuations
  emptyText?: string // message when nothing matches the filter
  persistenceKey?: string // restores the opened project after a page refresh
}

const cardBtn =
  'group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-gold-400/40 hover:bg-white/10'
const chip =
  'shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-emerald-100/80 transition group-hover:border-gold-400/50 group-hover:text-gold-200'

const ProjectValuationPicker = ({ toId, actionLabel = 'Open →', onSelect, completed = [], statusFilter, emptyText, persistenceKey }: Props) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [project, setProjectState] = useState<string | null>(() =>
    persistenceKey ? localStorage.getItem(persistenceKey) : null,
  )

  const setProject = (projectId: string | null) => {
    setProjectState(projectId)
    if (!persistenceKey) return
    if (projectId) localStorage.setItem(persistenceKey, projectId)
    else localStorage.removeItem(persistenceKey)
  }

  useEffect(() => {
    if (!toId) return
    let cancelled = false
    const load = () => {
      getAssignments(toId).then((r) => {
        if (cancelled) return
        setAssignments(statusFilter ? r.assignments.filter(statusFilter) : r.assignments)
        setLoading(false)
      })
    }
    load()
    // Re-check when this tab regains focus/visibility, so an assignment made
    // by a coordinator in another tab shows up without a manual page reload.
    // Also poll periodically as a fallback, since focus/visibility events are
    // not consistently fired across every browser and window setup.
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    window.addEventListener('focus', load)
    document.addEventListener('visibilitychange', onVisible)
    const interval = setInterval(load, 15000)
    return () => {
      cancelled = true
      window.removeEventListener('focus', load)
      document.removeEventListener('visibilitychange', onVisible)
      clearInterval(interval)
    }
  }, [toId, statusFilter])

  // Distinct projects (each with its valuations, ordered).
  const projects = useMemo(() => {
    const m = new Map<string, Assignment[]>()
    assignments.forEach((a) => {
      const arr = m.get(a.projectId) ?? []
      arr.push(a)
      m.set(a.projectId, arr)
    })
    return Array.from(m.values()).map((arr) => arr.slice().sort((a, b) => a.valuationId - b.valuationId))
  }, [assignments])

  useEffect(() => {
    if (!loading && project && !assignments.some((assignment) => assignment.projectId === project)) {
      setProject(null)
    }
  }, [assignments, loading, project])

  if (loading) return <p className="text-center text-sm text-emerald-200/60">Loading your projects…</p>
  if (assignments.length === 0)
    return (
      <Card className="p-8 text-center">
        <p className="font-semibold text-gold-200">No projects</p>
        <p className="mt-1 text-sm text-emerald-100/70">{emptyText ?? 'Projects assigned to you will appear here.'}</p>
      </Card>
    )

  // Level 2 — the valuations inside the chosen project.
  if (project) {
    const vals = assignments.filter((a) => a.projectId === project).sort((a, b) => a.valuationId - b.valuationId)
    if (vals.length === 0) {
      return (
        <Card className="p-8 text-center">
          <p className="font-semibold text-gold-200">No valuations available</p>
          <p className="mt-1 text-sm text-emerald-100/70">
            The selected project does not contain any valuations right now.
            Please choose another project.
          </p>
          <Button type="button" variant="outline" onClick={() => setProject(null)} className="mt-4 !px-5 !py-2 text-sm">
            ← All projects
          </Button>
        </Card>
      )
    }
    const head = vals[0]
    return (
      <div className="space-y-3">
        <Button type="button" variant="outline" onClick={() => setProject(null)} className="!px-5 !py-2 text-sm">
          ← All projects
        </Button>
        <Card className="p-4">
          <p className="font-semibold text-gold-300">{project}</p>
          <p className="text-sm text-emerald-100/80">
            {head.owner.name} · {head.location.address || head.location.district || '—'}
          </p>
        </Card>
        {vals.map((a) => (
          <button key={a.valuationId} type="button" onClick={() => onSelect(a)} className={cardBtn}>
            <div className="min-w-0">
              <p className="font-semibold text-gold-300">Valuation #{a.valuationId}</p>
              <p className="mt-0.5 text-xs text-emerald-200/50">
                {a.status} · Visit {a.date || '—'} {a.time}
              </p>
            </div>
            <span className={chip}>{actionLabel}</span>
          </button>
        ))}
      </div>
    )
  }

  // Level 1 — the projects.
  return (
    <div className="space-y-3">
      {projects.map((arr) => {
        const a = arr[0]
        const saved = completed.includes(a.projectId)
        return (
          <button key={a.projectId} type="button" onClick={() => setProject(a.projectId)} className={cardBtn}>
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-semibold text-gold-300">
                {a.projectId}
                {saved && (
                  <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
                    ✓ Saved
                  </span>
                )}
              </p>
              <p className="mt-0.5 truncate text-sm text-emerald-100/80">
                {a.owner.name} · {a.location.address || a.location.district || '—'}
              </p>
            </div>
            <span className={chip}>
              {arr.length} valuation{arr.length > 1 ? 's' : ''} →
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ProjectValuationPicker
