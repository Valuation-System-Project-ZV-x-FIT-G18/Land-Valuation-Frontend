import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessionState } from '@/Common_Pages/hooks/useSessionState'
import Button from '@/Common_Pages/components/ui/Button'
import Card from '@/Common_Pages/components/ui/Card'
import Input from '@/Common_Pages/components/ui/Input'
import Modal from '@/Common_Pages/components/ui/Modal'
import GradientText from '@/Common_Pages/components/ui/GradientText'
import { validateNIC } from '@/Common_Pages/validation/validateNIC'
import {
  searchApplicantByNic,
  searchApplicantByProjectId,
} from '@/Role_Pages/coordinator/create-project/api/create-project'
import type { ApplicantSearchResult } from '@/Role_Pages/coordinator/create-project/types/create-project'
import SearchEmptyState from '@/Role_Pages/coordinator/create-project/components/SearchEmptyState'

type Mode = 'nic' | 'project'

const modes: [Mode, string][] = [
  ['nic', 'Search by NIC'],
  ['project', 'Search by Project ID'],
]

const ApplicantSearch = () => {
  const navigate = useNavigate()
  // Persisted so a refresh keeps the search; cleared on window blur (below).
  const [mode, setMode] = useSessionState<Mode>('applicantSearchMode', 'nic')
  const [query, setQuery] = useSessionState('applicantSearchQuery', '')
  const [result, setResult] = useSessionState<ApplicantSearchResult | null>(
    'applicantSearchResult',
    null,
  )
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)
  const [notice, setNotice] = useState('')
  const [applicantProjects, setApplicantProjects] = useState<
    { projectId: string; propertyType: string; status: string }[]
  >([])
  // Persisted so the "not found" popup also survives a refresh.
  const [showNotFound, setShowNotFound] = useSessionState('applicantSearchNotFound', false)

  const switchMode = (m: Mode) => {
    setMode(m)
    setQuery('')
    setError('')
    setResult(null)
    setNotice('')
    setApplicantProjects([])
    setShowNotFound(false)
  }

  // Reset the search back to an empty state (used by the Cancel button).
  const clearSearch = () => {
    setQuery('')
    setResult(null)
    setError('')
    setNotice('')
    setApplicantProjects([])
    setShowNotFound(false)
  }

  // Projects already created for a given applicant NIC.
  const loadApplicantProjects = async (nicValue: string) => {
    try {
      const r = await fetch(`/api/coordinator/projects/status?q=${encodeURIComponent(nicValue)}`)
      const body = await r.json()
      const list = (body.projects ?? []).filter((p: { nic: string }) => p.nic === nicValue)
      setApplicantProjects(list)
    } catch {
      setApplicantProjects([])
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setNotice('')
    setApplicantProjects([])
    if (mode === 'nic') {
      const err = validateNIC(query)
      if (err) return (setError(err), setResult(null), undefined)
    } else if (!query.trim()) {
      return (setError('Enter a Project ID.'), setResult(null), undefined)
    }
    setError('')
    setSearching(true)
    const res =
      mode === 'nic'
        ? await searchApplicantByNic(query)
        : await searchApplicantByProjectId(query)
    setResult(res)
    setSearching(false)
    // NIC entered but no matching loan applicant -> show the register popup.
    if (mode === 'nic' && !res.found && !res.error) setShowNotFound(true)
    // Show any projects already created for this applicant.
    if (res.found && res.applicant?.nic) loadApplicantProjects(res.applicant.nic)
  }

  const applicant = result?.found ? result.applicant : undefined
  const rows: [string, string][] = []
  if (applicant) {
    rows.push(['Name', applicant.name], ['NIC', applicant.nic])
    if (applicant.email) rows.push(['Email', applicant.email])
    if (applicant.userId) rows.push(['Login ID', applicant.userId])
  }


  return (
    <div className="mt-6">
      {/* Hero */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Applicant <GradientText>Search</GradientText>
        </h2>
        <p className="mx-auto mt-2 max-w-md text-emerald-100/70">
          Look up a loan applicant by NIC or Project ID.
        </p>
      </div>

      {/* Glass search card */}
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        {/* Mode toggle */}
        <div className="flex justify-center">
          <div className="inline-flex rounded-xl border border-white/10 bg-emerald-950/40 p-1">
            {modes.map(([m, label]) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  mode === m
                    ? 'bg-gradient-to-r from-amber-300 to-gold-400 text-emerald-950 shadow'
                    : 'text-emerald-100/70 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                aria-label="Search query"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setError('')
                }}
                placeholder={mode === 'nic' ? 'e.g. 199512345678 or 951234567V' : 'e.g. pro001'}
                error={error || undefined}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                }
              />
            </div>
            <Button type="submit" loading={searching} className="shrink-0">
              {searching ? 'Searching…' : 'Search'}
            </Button>
          </div>
          {mode === 'nic' && !error && (
            <p className="mt-2 text-xs text-emerald-200/60">
              Accepts old format (9 digits + V/X) and new format (12 digits).
            </p>
          )}
        </form>
      </div>

      {/* Empty state (before a search) */}
      {!result && <SearchEmptyState />}

      {/* Network/server error */}
      {result?.error && (
        <p className="mx-auto mt-6 max-w-2xl rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          {result.error}
        </p>
      )}

      {/* Found */}
      {applicant && (
        <Card className="mx-auto mt-6 max-w-2xl p-6 sm:p-8">
          <p className="flex items-center gap-2 font-semibold text-emerald-200">
            <span>✓</span> Applicant found in the system
          </p>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-wide text-emerald-200/50">{k}</dt>
                <dd className="text-sm font-medium text-white">{v}</dd>
              </div>
            ))}
          </dl>
          {/* Projects already created for this applicant. */}
          {applicantProjects.length > 0 && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-200/60">
                Projects created for this applicant
              </p>
              <div className="space-y-1.5">
                {applicantProjects.map((p) => (
                  <div key={p.projectId} className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium text-gold-300">{p.projectId}</span>
                    <span className="text-xs text-emerald-100/70">{p.propertyType || '—'} · {p.status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              fullWidth
              onClick={() =>
                navigate('/coordinator/new-project', {
                  state: { nic: applicant.nic },
                })
              }
            >
              Create Project →
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={clearSearch}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Project ID not found (inline note) */}
      {result && !result.error && !result.found && mode === 'project' && (
        <Card className="mx-auto mt-6 max-w-2xl p-6 sm:p-8">
          <p className="font-semibold text-gold-200">No applicant found</p>
          <p className="mt-1 text-sm text-emerald-100/70">
            No applicant is linked to that Project ID.
          </p>
        </Card>
      )}

      {notice && <p className="mx-auto mt-4 max-w-2xl text-center text-sm text-gold-200">{notice}</p>}

      {/* NIC not-found popup */}
      <Modal open={showNotFound} onClose={() => setShowNotFound(false)}>
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-400/15">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-amber-400"
            >
              <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h16.9a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
              <path d="M12 9v4" />
              <path d="M12 17h.01" />
            </svg>
          </div>

          <h3 className="mt-4 text-xl font-bold text-red-300">No Results Found</h3>
          <p className="mx-auto mt-2 max-w-xs text-sm text-emerald-100/70">
            The NIC you entered doesn&apos;t match any loan applicant in the system.
          </p>
          <p className="mt-3 text-sm text-emerald-200/60">Want to add them?</p>

          <Button
            type="button"
            fullWidth
            className="mt-5"
            onClick={() => {
              setShowNotFound(false)
              navigate('/coordinator/register-applicant', { state: { nic: query } })
            }}
          >
            + Register New Applicant
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default ApplicantSearch
