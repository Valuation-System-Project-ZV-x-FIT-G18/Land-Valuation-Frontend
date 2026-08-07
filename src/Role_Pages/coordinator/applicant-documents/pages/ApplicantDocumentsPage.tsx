import { useState } from 'react'
import Card from '@/Common_Pages/components/ui/Card'
import Button from '@/Common_Pages/components/ui/Button'
import Input from '@/Common_Pages/components/ui/Input'
import Badge from '@/Common_Pages/components/ui/Badge'
import PageHeader from '@/Common_Pages/components/ui/PageHeader'
import EmptyState from '@/Common_Pages/components/ui/EmptyState'
import SuccessModal from '@/Common_Pages/components/ui/SuccessModal'
import { validateNIC } from '@/Common_Pages/validation/validateNIC'
import { documentSections } from '@/Role_Pages/loan-applicant/documents/constants/documentTypes'
import {
  getDocuments,
  documentUrl,
  setDocumentStatus,
  type UploadedDoc,
} from '@/Role_Pages/loan-applicant/documents/api/documents'
import { searchProjects } from '@/Role_Pages/coordinator/project-status/api/project-status'
import type { ProjectRow } from '@/Role_Pages/coordinator/project-status/types/project-status'

// Flat lookup of docType -> label for showing readable names.
const labelOf: Record<string, string> = {}
documentSections.forEach((s) => s.docs.forEach((d) => (labelOf[d.key] = d.label)))

// Coordinator > Applicant Documents: view + review a loan applicant's uploads.
// An applicant can have more than one project — pick which one to review.
const ApplicantDocumentsPage = () => {
  const [nic, setNic] = useState('')
  const [searchedNic, setSearchedNic] = useState('')
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [projectId, setProjectId] = useState('')
  const [docs, setDocs] = useState<UploadedDoc[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  // Track which doc + action is updating so its button shows a spinner.
  const [reviewing, setReviewing] = useState('')

  const loadDocs = async (n: string, p: string) => {
    const r = await getDocuments(n, p)
    setDocs(r.documents)
  }

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validateNIC(nic)
    if (err) return setError(err)
    setError('')
    setLoading(true)
    const n = nic.trim()
    const res = await searchProjects(n)
    setProjects(res.projects)
    // No project yet ('') is valid — it's the "general" bucket an applicant
    // can upload to right after registering, before a project exists.
    const first = res.projects[0]?.projectId ?? ''
    setProjectId(first)
    setSearchedNic(n)
    await loadDocs(n, first)
    setSearched(true)
    setLoading(false)
  }

  const selectProject = async (p: string) => {
    setProjectId(p)
    setLoading(true)
    await loadDocs(searchedNic, p)
    setLoading(false)
  }

  const review = async (doc: UploadedDoc, status: string) => {
    setReviewing(doc.docType + status)
    setError(''); setNotice('')
    const label = labelOf[doc.docType] ?? doc.docType
    const res = await setDocumentStatus(searchedNic, projectId, doc.docType, status, label)
    if (res.ok) {
      await loadDocs(searchedNic, projectId)
      setNotice(
        status === 'Approved'
          ? `"${label}" has been approved. The applicant has been notified.`
          : `"${label}" has been sent back for resubmission. The applicant has been notified.`,
      )
    } else setError(res.error ?? 'Could not update.')
    setReviewing('')
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SuccessModal
        open={!!notice}
        title="Document Updated"
        message={notice}
        closeLabel="Done"
        onClose={() => setNotice('')}
      />
      <PageHeader
        title="Applicant"
        accent="Documents"
        subtitle="Enter an applicant's NIC to view and review the documents they uploaded."
      />

      <Card className="p-6 sm:p-8">
        <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input
              aria-label="Applicant NIC"
              value={nic}
              onChange={(e) => { setNic(e.target.value); setError('') }}
              placeholder="Applicant NIC (e.g. 200012345678)"
              error={error || undefined}
            />
          </div>
          <Button type="submit" loading={loading} className="shrink-0">
            {loading ? 'Loading…' : 'View'}
          </Button>
        </form>
      </Card>

      {searched && !loading && projects.length === 0 && docs.length > 0 && (
        <p className="text-center text-sm text-emerald-200/70">
          No project has been created for this applicant yet — these are documents they uploaded
          before a project existed.
        </p>
      )}

      {projects.length > 1 && (
        <Card className="flex flex-wrap items-center gap-2 p-4">
          <span className="text-sm text-emerald-100/70">Project:</span>
          {projects.map((p) => (
            <button
              key={p.projectId}
              type="button"
              onClick={() => selectProject(p.projectId)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                p.projectId === projectId
                  ? 'border-gold-400/60 bg-gold-400/15 text-gold-200'
                  : 'border-white/15 bg-white/5 text-emerald-100/70 hover:border-gold-400/40'
              }`}
            >
              {p.projectId} · {p.propertyType || 'Property'}
            </button>
          ))}
        </Card>
      )}

      {searched && !loading && docs.length === 0 && (
        <EmptyState
          icon="📄"
          title="No documents"
          message="This applicant hasn't uploaded any documents yet."
        />
      )}

      {docs.length > 0 && (
        <div className="space-y-3">
          {docs.map((d) => (
            <Card key={d.docType} hover className="flex flex-wrap items-center gap-3 p-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{labelOf[d.docType] ?? d.docType}</p>
                {d.fileName && (
                  <a href={documentUrl(searchedNic, projectId, d.docType)} className="mt-0.5 inline-flex items-center gap-1 text-xs text-gold-200 underline">
                    📎 {d.fileName}
                  </a>
                )}
              </div>
              <Badge status={d.status} className="shrink-0">{d.status}</Badge>
              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="success"
                  size="sm"
                  loading={reviewing === d.docType + 'Approved'}
                  onClick={() => review(d, 'Approved')}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={reviewing === d.docType + 'Resubmit'}
                  onClick={() => review(d, 'Resubmit')}
                >
                  Resubmit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default ApplicantDocumentsPage
