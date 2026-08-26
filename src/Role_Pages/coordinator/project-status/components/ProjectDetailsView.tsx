import { useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import { projectSections, projectUploads } from '@/Role_Pages/coordinator/new-project/constants/projectFields'
import { getProjectDetails, projectFileUrl, type ProjectDetails } from '@/Role_Pages/coordinator/project-status/api/project-status'

// Full read-only view of a project: every stored field grouped into its section,
// plus the uploaded documents (survey plan, deed, etc.) opened inline.
type Props = { projectId: string; onBack: () => void }

const ProjectDetailsView = ({ projectId, onBack }: Props) => {
  const [data, setData] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProjectDetails(projectId).then((d) => { setData(d); setLoading(false) })
  }, [projectId])

  if (loading) return <p className="text-center text-sm text-emerald-200">Loading project details…</p>
  if (!data) return <p className="text-center text-sm text-amber-300">Project not found.</p>

  const d = data.details
  const documentByType = new Map(data.documents.map((document) => [document.type, document]))
  const receivedCount = projectUploads.filter((upload) => documentByType.has(upload.name)).length
  const requiredPending = projectUploads.filter((upload) => upload.required && !documentByType.has(upload.name)).length

  return (
    <div className="space-y-5">
      <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">← Back</Button>

      <Card className="p-5 sm:p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-accent-300">Project {data.projectId}</h3>
        <p className="mt-1 text-sm text-emerald-100">Applicant NIC: {data.applicantNic} · Status: {data.status}</p>
      </Card>

      {projectSections.map((section) => {
        const rows = section.fields
          .map((f) => [f.label, d[f.name]] as [string, string])
          .filter(([, v]) => v && String(v).trim())
        if (!rows.length) return null
        return (
          <Card key={section.title} className="p-5 sm:p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-accent-300">
              {section.title}
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] uppercase tracking-wide text-emerald-200">{label}</dt>
                  <dd className="text-sm font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )
      })}

      {/* Complete read-only checklist — received files remain viewable. */}
      <Card className="p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-sm font-bold uppercase tracking-wide text-accent-300">Document Checklist</h3><p className="mt-1 text-xs text-emerald-100/60">Required and supporting property documents.</p></div><div className="flex gap-2 text-xs"><span className="rounded-full bg-emerald-400/15 px-2.5 py-1 font-semibold text-emerald-200">{receivedCount} received</span>{requiredPending > 0 && <span className="rounded-full bg-amber-400/15 px-2.5 py-1 font-semibold text-amber-200">{requiredPending} required pending</span>}</div></div>
          <div className="space-y-2">
            {projectUploads.map((upload) => {
              const doc = documentByType.get(upload.name)
              return (
                <div key={upload.name} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-white">{upload.label}</p>{upload.required && <span className="text-[10px] font-semibold uppercase tracking-wide text-amber-200">Required</span>}</div>
                    <p className={`truncate text-xs ${doc ? 'text-emerald-200' : 'text-emerald-100/45'}`}>{doc?.fileName || (upload.required ? 'Pending document' : 'Not provided')}</p>
                  </div>
                  {doc ? <a
                    href={projectFileUrl(projectId, upload.name)}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-lg border border-white/15 px-4 py-1.5 text-xs font-medium text-accent-200 transition hover:border-accent-400/50 hover:bg-accent-400/10"
                  >
                    View ↗
                  </a> : <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${upload.required ? 'bg-amber-400/15 text-amber-200' : 'bg-white/5 text-emerald-100/50'}`}>{upload.required ? 'Pending' : 'Optional'}</span>}
                </div>
              )
            })}
          </div>
      </Card>
    </div>
  )
}

export default ProjectDetailsView
