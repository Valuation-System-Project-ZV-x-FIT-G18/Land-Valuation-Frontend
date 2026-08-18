import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import SitePhotoUpload from '@/Role_Pages/technical-officer/site-photos/components/SitePhotoUpload'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import TOWorkflowStepper from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

// Technical Officer > Site Photo.
// Projects → valuations → upload that project's site photographs.
const SitePhotoPage = () => {
  const location = useLocation()
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const [selected, setSelected] = useState<Assignment | null>(() => (location.state as { assignment?: Assignment } | null)?.assignment ?? null)
  const [directProjectId, setDirectProjectId] = useState(() => (location.state as { projectId?: string } | null)?.projectId ?? '')

  if (selected || directProjectId) {
    return <SitePhotoUpload projectId={selected?.projectId ?? directProjectId} toId={toId} onBack={() => { setSelected(null); setDirectProjectId('') }} />
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <TOWorkflowStepper current="photos" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Site <GradientText>Photo</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Choose a project, then a valuation, to upload its site photographs.
        </p>
      </div>
      <ProjectValuationPicker toId={toId} actionLabel="Upload photos →" onSelect={setSelected} />
    </div>
  )
}

export default SitePhotoPage
