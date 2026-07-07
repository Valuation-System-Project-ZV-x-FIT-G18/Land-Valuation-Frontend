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

  if (loading) return <p className="text-center text-sm text-emerald-200/60">Loading project details…</p>
  if (!data) return <p className="text-center text-sm text-amber-300">Project not found.</p>

  const d = data.details

  return (
    <div className="space-y-5">
      <Button type="button" variant="outline" onClick={onBack} className="!px-5 !py-2.5 text-sm">← Back</Button>

      <Card className="p-5 sm:p-6">
        <h3 className="text-sm font-bold uppercase tracking-wide text-gold-300">Project {data.projectId}</h3>
        <p className="mt-1 text-sm text-emerald-100/80">Applicant NIC: {data.applicantNic} · Status: {data.status}</p>
      </Card>

      {projectSections.map((section) => {
        const rows = section.fields
          .map((f) => [f.label, d[f.name]] as [string, string])
          .filter(([, v]) => v && String(v).trim())
        if (!rows.length) return null
        return (
          <Card key={section.title} className="p-5 sm:p-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-gold-300">
              <span>{section.icon}</span> {section.title}
            </h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              {rows.map(([label, value]) => (
                <div key={label}>
                  <dt className="text-[11px] uppercase tracking-wide text-emerald-200/50">{label}</dt>
                  <dd className="text-sm font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>
        )
      })}

      {/* Uploaded documents — viewable (PDF/image) */}
      <Card className="p-5 sm:p-6">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-gold-300">📎 Documents</h3>
        {data.documents.length === 0 ? (
          <p className="text-sm text-emerald-100/60">No documents uploaded.</p>
        ) : (
          <div className="space-y-2">
            {data.documents.map((doc) => {
              const label = projectUploads.find((u) => u.name === doc.type)?.label ?? doc.type
              return (
                <div key={doc.type} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="truncate text-xs text-emerald-200/50">{doc.fileName}</p>
                  </div>
                  <a
                    href={projectFileUrl(projectId, doc.type)}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 rounded-lg border border-white/15 px-4 py-1.5 text-xs font-medium text-gold-200 transition hover:border-gold-400/50 hover:bg-gold-400/10"
                  >
                    View ↗
                  </a>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

export default ProjectDetailsView
