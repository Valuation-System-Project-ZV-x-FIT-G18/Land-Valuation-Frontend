import { useEffect, useMemo, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import { getAssignments, type Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

type Props = {
  toId: string
  actionLabel?: string
  onSelect: (a: Assignment) => void
  completed?: string[]
  statusFilter?: (a: Assignment) => boolean
  emptyText?: string
  persistenceKey?: string
  searchTerm?: string
  directProjectSelection?: boolean
  projectActionLabel?: string
}

const cardBtn = 'group flex w-full items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-gold-400/40 hover:bg-white/10'
const chip = 'shrink-0 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-medium text-emerald-100/80 transition group-hover:border-gold-400/50 group-hover:text-gold-200'

const projectStage = (assignments: Assignment[]) => {
  const rejected = assignments.some((a) => a.reviewStatus.toLowerCase().includes('reject'))
  const completed = assignments.every((a) => a.reviewStatus.toLowerCase().includes('locked') || a.status.toLowerCase().includes('complete'))
  const submitted = assignments.some((a) => a.status === 'Draft Submitted' || a.reviewStatus.toLowerCase().startsWith('pending_'))
  const isNew = assignments.some((a) => a.status === 'Technical Officer Assigned')
  if (rejected) return { label: 'Correction required', classes: 'border-amber-300/45 bg-amber-300/10 text-amber-200' }
  if (completed) return { label: 'Completed', classes: 'border-sky-300/40 bg-sky-300/10 text-sky-100' }
  if (submitted) return { label: 'Submitted for review', classes: 'border-sky-300/40 bg-sky-300/10 text-sky-100' }
  if (isNew) return { label: 'New assignment', classes: 'border-gold-400/45 bg-gold-400/10 text-gold-200' }
  return { label: 'In progress', classes: 'border-emerald-300/35 bg-emerald-300/10 text-emerald-100' }
}

const ProjectValuationPicker = ({ toId, actionLabel = 'Open', onSelect, completed = [], statusFilter, emptyText, persistenceKey, searchTerm = '', directProjectSelection = false, projectActionLabel }: Props) => {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [loading, setLoading] = useState(true)
  const [project, setProjectState] = useState<string | null>(() => persistenceKey ? localStorage.getItem(persistenceKey) : null)

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
      void getAssignments(toId).then((result) => {
        if (!cancelled) {
          setAssignments(statusFilter ? result.assignments.filter(statusFilter) : result.assignments)
          setLoading(false)
        }
      })
    }
    load()
    window.addEventListener('focus', load)
    const interval = setInterval(load, 15000)
    return () => { cancelled = true; window.removeEventListener('focus', load); clearInterval(interval) }
  }, [toId, statusFilter])

  const visibleAssignments = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) return assignments
    return assignments.filter((a) => [a.projectId, a.owner.name, a.location.district, a.location.address].join(' ').toLowerCase().includes(query))
  }, [assignments, searchTerm])

  const projects = useMemo(() => {
    const grouped = new Map<string, Assignment[]>()
    visibleAssignments.forEach((assignment) => {
      const list = grouped.get(assignment.projectId) ?? []
      list.push(assignment)
      grouped.set(assignment.projectId, list)
    })
    return Array.from(grouped.values()).map((list) => list.slice().sort((a, b) => a.valuationId - b.valuationId))
  }, [visibleAssignments])

  useEffect(() => {
    if (!loading && project && !assignments.some((item) => item.projectId === project)) setProject(null)
  }, [assignments, loading, project])

  if (loading) return <p className="text-center text-sm text-emerald-200/60">Loading your projects…</p>
  if (assignments.length === 0 || projects.length === 0) return (
    <Card className="p-8 text-center">
      <p className="font-semibold text-gold-200">No projects</p>
      <p className="mt-1 text-sm text-emerald-100/70">{emptyText ?? (searchTerm ? 'No projects match your search.' : 'Projects assigned to you will appear here.')}</p>
    </Card>
  )

  if (project) {
    const vals = assignments.filter((item) => item.projectId === project).sort((a, b) => a.valuationId - b.valuationId)
    const head = vals[0]
    return (
      <div className="space-y-4">
        <Button type="button" variant="outline" onClick={() => setProject(null)} className="!px-5 !py-2 text-sm">← All projects</Button>
        <Card className="border-gold-400/25 bg-gold-400/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Project</p>
          <p className="mt-1 text-xl font-bold text-gold-300">{project}</p>
          <p className="mt-1 text-sm text-white/75">{head.owner.name} · {head.location.address || head.location.district || 'Location to be confirmed'}</p>
        </Card>
        <div className="flex items-center gap-3"><span className="h-px flex-1 bg-white/10" /><p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/60">Select a valuation</p><span className="h-px flex-1 bg-white/10" /></div>
        {vals.map((a) => (
          <button key={a.valuationId} type="button" onClick={() => onSelect(a)} className={cardBtn}>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-100/55">Valuation</p>
              <p className="mt-1 font-semibold text-white">Valuation #{a.valuationId}</p>
              <p className="mt-0.5 text-xs text-emerald-100/60">{a.status} · Visit {a.date || 'Not scheduled'} {a.time}</p>
            </div>
            <span className={chip}>{actionLabel} →</span>
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {projects.map((list) => {
        const a = list[0]
        const saved = completed.includes(a.projectId)
        const stage = projectStage(list)
        return (
          <button
            key={a.projectId}
            type="button"
            onClick={() => directProjectSelection ? onSelect(a) : setProject(a.projectId)}
            className={cardBtn}
          >
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/55">Project</p>
              <p className="mt-1 flex items-center gap-2 font-semibold text-gold-300">
                {a.projectId}
                {saved && <span className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-200">Saved</span>}
              </p>
              <span className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium ${stage.classes}`}>{stage.label}</span>
              <p className="mt-1 truncate text-sm text-white/75">{a.owner.name} · {a.location.district || 'Location to be confirmed'}</p>
              {(a.date || a.time) && (
                <p className="mt-1 text-xs text-emerald-100/60">
                  Visit {a.date || 'Not scheduled'} {a.time ? `at ${a.time}` : ''}
                </p>
              )}
            </div>
            <span className={chip}>
              {projectActionLabel ?? `${list.length} valuation${list.length > 1 ? 's' : ''} →`}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default ProjectValuationPicker
