import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import MapWorkspace from '@/Role_Pages/technical-officer/mapping/components/MapWorkspace'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

// Technical Officer > GPS & Map Integration.
// Projects → valuations → pin the location & build map/access info.
const GpsMapPage = () => {
  const location = useLocation()
  const { user } = useAuth()
  const toId = user?.userId ?? ''
  const [selected, setSelected] = useState<Assignment | null>(() => (location.state as { assignment?: Assignment } | null)?.assignment ?? null)
  const [directProjectId, setDirectProjectId] = useState(() => (location.state as { projectId?: string } | null)?.projectId ?? '')

  if (selected || directProjectId) {
    return <MapWorkspace projectId={selected?.projectId ?? directProjectId} onBack={() => { setSelected(null); setDirectProjectId('') }} />
  }

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <div className="rounded-2xl border border-white/10 bg-emerald-950/40 px-6 py-8 text-center shadow-card backdrop-blur-sm sm:px-10 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300/75">Technical Officer Workspace</p>
        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          GPS &amp; <GradientText>Map Integration</GradientText>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-emerald-100/65 sm:text-base">
          Select an assigned project to verify its exact position, review satellite imagery, and prepare professional access and locality notes.
        </p>
      </div>
      <ProjectValuationPicker toId={toId} actionLabel="Open map →" onSelect={setSelected} />
    </div>
  )
}

export default GpsMapPage
