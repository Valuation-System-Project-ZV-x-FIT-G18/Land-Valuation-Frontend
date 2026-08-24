import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import Input from '@/Common_Pages/components/ui/Input'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import SitePhotoUpload from '@/Role_Pages/technical-officer/site-photos/components/SitePhotoUpload'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import TOWorkflowStepper from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import WorkflowPreviewLayout from '@/Role_Pages/technical-officer/shared/WorkflowPreviewLayout'
import type { ReportNavigationTarget } from '@/Role_Pages/technical-officer/draft/components/LiveReportPreview'

const SITE_PHOTO_STORAGE_KEY = 'technical-officer-site-photo-project'

// Technical Officer > Site Photo.
// Projects → valuations → upload that project's site photographs.
const SitePhotoPage = () => {
  const { user } = useAuth()
  const location = useLocation()
  const toId = user?.userId ?? ''
  const [searchTerm, setSearchTerm] = useState('')
  const [previewVersion, setPreviewVersion] = useState(0)
  const [navigationTarget, setNavigationTarget] = useState<ReportNavigationTarget | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    const stateProjectId = (location.state as { projectId?: string } | null)?.projectId
    if (stateProjectId) return stateProjectId

    try {
      return localStorage.getItem(SITE_PHOTO_STORAGE_KEY)
    } catch {
      return null
    }
  })

  useEffect(() => {
    const stateProjectId = (location.state as { projectId?: string } | null)?.projectId
    if (stateProjectId) {
      setSelectedProjectId(stateProjectId)
      try {
        localStorage.setItem(SITE_PHOTO_STORAGE_KEY, stateProjectId)
      } catch {
        // ignore storage errors
      }
    }
  }, [location.state])

  const persistProject = (projectId: string | null) => {
    setSelectedProjectId(projectId)
    try {
      if (projectId) localStorage.setItem(SITE_PHOTO_STORAGE_KEY, projectId)
      else localStorage.removeItem(SITE_PHOTO_STORAGE_KEY)
    } catch {
      // ignore storage errors
    }
  }

  if (selectedProjectId) {
    return <WorkflowPreviewLayout projectId={selectedProjectId} refreshToken={previewVersion} navigationTarget={navigationTarget}>
      <SitePhotoUpload projectId={selectedProjectId} toId={toId} onBack={() => persistProject(null)} onDataSaved={() => setPreviewVersion((value) => value + 1)} onReportNavigate={(section) => setNavigationTarget({ section, requestId: Date.now() })} />
    </WorkflowPreviewLayout>
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <TOWorkflowStepper current="photos" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Site <GradientText>Photo</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-emerald-100/70">
          Select an assigned project to upload, review, or replace its site photographs.
        </p>
      </div>

      <Input
        aria-label="Search assigned projects"
        icon={<span aria-hidden="true">⌕</span>}
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search by project ID, owner, address, or district…"
        className="bg-black/10"
      />

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">Assigned projects</p>
          <p className="mt-1 text-sm text-emerald-100/60">Choose one to manage its photo evidence.</p>
        </div>
        {searchTerm && (
          <button type="button" onClick={() => setSearchTerm('')} className="text-xs font-medium text-gold-300 hover:text-gold-200">
            Clear search
          </button>
        )}
      </div>

      <ProjectValuationPicker
        toId={toId}
        actionLabel="Upload photos →"
        persistenceKey={SITE_PHOTO_STORAGE_KEY}
        searchTerm={searchTerm}
        directProjectSelection
        projectActionLabel="Manage photos →"
        onSelect={(assignment: Assignment) => persistProject(assignment.projectId)}
      />
    </div>
  )
}

export default SitePhotoPage
