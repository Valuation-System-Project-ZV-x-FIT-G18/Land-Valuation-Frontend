import { useCallback, useEffect, useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import DocumentRow from '@/Role_Pages/loan-applicant/documents/components/DocumentRow'
import { documentSections } from '@/Role_Pages/loan-applicant/documents/constants/documentTypes'
import {
  getDocuments,
  uploadDocument,
  type UploadedDoc,
} from '@/Role_Pages/loan-applicant/documents/api/documents'
import { searchProjects } from '@/Role_Pages/coordinator/project-status/api/project-status'
import type { ProjectRow } from '@/Role_Pages/coordinator/project-status/types/project-status'

// Loan Applicant > My Documents. Upload the documents needed for the valuation.
// An applicant can have more than one project — pick which one to manage.
const DocumentsPage = () => {
  const { user } = useAuth()
  const nic = user?.userId ?? '' // a loan applicant's user_id is their NIC
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [projectId, setProjectId] = useState('')
  const [projectSearch, setProjectSearch] = useState('')
  const [uploaded, setUploaded] = useState<Record<string, UploadedDoc>>({})
  const [loading, setLoading] = useState(true)

  // Load this applicant's own projects once, and default to the first one.
  useEffect(() => {
    if (!nic) return
    searchProjects(nic).then((res) => {
      setProjects(res.projects)
      setProjectId(res.projects[0]?.projectId ?? '')
    })
  }, [nic])

  const load = useCallback(async () => {
    if (!nic || !projectId) { setLoading(false); return }
    setLoading(true)
    const res = await getDocuments(nic, projectId)
    const map: Record<string, UploadedDoc> = {}
    res.documents.forEach((d) => (map[d.docType] = d))
    setUploaded(map)
    setLoading(false)
  }, [nic, projectId])

  useEffect(() => {
    load()
  }, [load])

  const handleUpload = async (docType: string, file: File) => {
    const res = await uploadDocument(nic, projectId, docType, file)
    if (res.ok) await load()
    return res
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          My <GradientText>Documents</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Upload the documents for your land valuation. Fields marked{' '}
          <span className="text-gold-300">*</span> are required.
        </p>
      </div>

      {projects.length > 1 && (
        <Card className="space-y-3 p-4">
          <input
            value={projectSearch}
            onChange={(e) => setProjectSearch(e.target.value)}
            placeholder="Search by Project ID…"
            className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white placeholder-emerald-200/40 outline-none focus:border-gold-400/60"
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-emerald-100/70">Project:</span>
            {projects
              .filter((p) => p.projectId.toLowerCase().includes(projectSearch.trim().toLowerCase()))
              .map((p) => (
                <button
                  key={p.projectId}
                  type="button"
                  onClick={() => setProjectId(p.projectId)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                    p.projectId === projectId
                      ? 'border-gold-400/60 bg-gold-400/15 text-gold-200'
                      : 'border-white/15 bg-white/5 text-emerald-100/70 hover:border-gold-400/40'
                  }`}
                >
                  {p.projectId} · {p.propertyType || 'Property'}
                </button>
              ))}
          </div>
        </Card>
      )}

      {projects.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="font-semibold text-gold-200">No project yet</p>
          <p className="mt-1 text-sm text-emerald-100/70">
            Your documents will appear here once a coordinator creates a project for you.
          </p>
        </Card>
      ) : loading ? (
        <p className="text-center text-sm text-emerald-200/60">Loading your documents…</p>
      ) : (
        documentSections.map((section) => (
          <Card key={section.title} className="p-5 sm:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-white">
              <span>{section.icon}</span> {section.title}
            </h2>
            <div className="space-y-2">
              {section.docs.map((doc) => (
                <DocumentRow
                  key={doc.key}
                  nic={nic}
                  projectId={projectId}
                  doc={doc}
                  uploaded={uploaded[doc.key]}
                  onUpload={handleUpload}
                />
              ))}
            </div>
          </Card>
        ))
      )}
    </div>
  )
}

export default DocumentsPage
