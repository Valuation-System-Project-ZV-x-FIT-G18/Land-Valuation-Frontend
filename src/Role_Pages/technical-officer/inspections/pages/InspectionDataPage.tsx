import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'
import LiveDraftBuilder from '@/Role_Pages/technical-officer/draft/components/LiveDraftBuilder'
import ProjectValuationPicker from '@/Role_Pages/technical-officer/assignments/components/ProjectValuationPicker'
import { getAssignments, type Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'
import TOWorkflowStepper from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'

// Technical Officer > Inspection Data.
// Projects → valuations → OCR upload + inspection form for that project.
const InspectionDataPage = () => {
  const { user } = useAuth()
  const location = useLocation()
  const toId = user?.userId ?? ''
  const [selected, setSelected] = useState<Assignment | null>(null)
  const [restoring, setRestoring] = useState(false)
  const [filterTab, setFilterTab] = useState<'active' | 'new' | 'completed'>('active')
  const [searchTerm, setSearchTerm] = useState('')

  // A selection coming from Assigned Projects opens the form immediately.
  // The assignment is reloaded here so a refresh still uses current data.
  useEffect(() => {
    const state = location.state as { projectId?: string; valuationId?: number } | null
    if (!state?.projectId || !state?.valuationId || !toId) return
    let active = true
    setRestoring(true)
    void getAssignments(toId).then((result) => {
      if (!active) return
      const match = result.assignments.find(
        (item) => item.projectId === state.projectId && item.valuationId === state.valuationId,
      )
      if (match) setSelected(match)
      setRestoring(false)
    })
    return () => { active = false }
  }, [location.state, toId])

  // Determine filter status function based on selected tab
  const statusFilter = (a: Assignment) => {
    const isNew = a.status === 'Technical Officer Assigned'
    const isCompleted = a.status.toLowerCase().includes('complete') || a.reviewStatus.toLowerCase().includes('locked')
    const isRejected = a.reviewStatus.toLowerCase().includes('reject')

    if (filterTab === 'active') {
      // Show: In-progress and Correction-required, but NOT completed
      return !isCompleted
    }
    if (filterTab === 'new') {
      // Show: Only new assignments
      return isNew
    }
    if (filterTab === 'completed') {
      // Show: Only completed or locked
      return isCompleted && !isRejected
    }
    return true
  }

  if (selected) {
    return (
      <div className="w-full">
        <LiveDraftBuilder
          assignment={selected}
          toId={toId}
          inspectionMode
          onBack={() => setSelected(null)}
        />
      </div>
    )
  }

  if (restoring) return <p className="text-center text-sm text-emerald-100/70">Opening your selected valuation…</p>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <TOWorkflowStepper current="inspection" />
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white sm:text-4xl">
          Inspection <GradientText>Data</GradientText>
        </h1>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Step 2 of 6 — Select an active valuation to record site inspection data.
        </p>
      </div>

      {/* Search bar */}
      <div>
        <input
          type="text"
          placeholder="Search by project ID, owner name or district"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-emerald-100/40 outline-none focus:border-gold-400/60 focus:ring-2 focus:ring-gold-400/30"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        <button
          onClick={() => setFilterTab('active')}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            filterTab === 'active'
              ? 'border-b-2 border-gold-300 text-gold-300'
              : 'text-emerald-100/60 hover:text-emerald-100'
          }`}
        >
          Active inspections
        </button>
        <button
          onClick={() => setFilterTab('new')}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            filterTab === 'new'
              ? 'border-b-2 border-gold-300 text-gold-300'
              : 'text-emerald-100/60 hover:text-emerald-100'
          }`}
        >
          New assignments
        </button>
        <button
          onClick={() => setFilterTab('completed')}
          className={`px-4 py-2.5 text-sm font-medium transition ${
            filterTab === 'completed'
              ? 'border-b-2 border-gold-300 text-gold-300'
              : 'text-emerald-100/60 hover:text-emerald-100'
          }`}
        >
          Completed archive
        </button>
      </div>

      {/* Instruction text */}
      <p className="text-sm text-emerald-100/70">
        Choose a project, then select the correct valuation scheduled for inspection.
      </p>

      {/* Project list */}
      <ProjectValuationPicker
        toId={toId}
        actionLabel="Start inspection →"
        onSelect={setSelected}
        statusFilter={statusFilter}
        searchTerm={searchTerm}
        emptyText={
          filterTab === 'active'
            ? 'No active projects. Check the Completed archive or refresh your assignments.'
            : filterTab === 'new'
              ? 'No new assignments at this time.'
              : 'No completed projects to archive.'
        }
      />
    </div>
  )
}

export default InspectionDataPage
