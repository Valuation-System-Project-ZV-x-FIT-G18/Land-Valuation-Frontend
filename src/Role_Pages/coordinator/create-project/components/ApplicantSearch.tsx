import { useEffect, useState } from 'react'
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
} from '@/Role_Pages/coordinator/create-project/api/create-project'
import type { ApplicantSearchResult } from '@/Role_Pages/coordinator/create-project/types/create-project'
import SearchEmptyState from '@/Role_Pages/coordinator/create-project/components/SearchEmptyState'

type ProjectSuggestion = {
  projectId: string
  nic: string
  propertyType: string
  status: string
}

const ApplicantSearch = () => {
  const navigate = useNavigate()
  // Persisted so a refresh keeps the search; cleared on window blur (below).
  const [query, setQuery] = useSessionState('applicantSearchQuery', '')
  const [result, setResult] = useSessionState<ApplicantSearchResult | null>(
    'applicantSearchResult',
    null,
  )
  const [error, setError] = useState('')
  const [searching, setSearching] = useState(false)
  const [projectSuggestions, setProjectSuggestions] = useState<ProjectSuggestion[]>([])
  const [suggestionsLoading, setSuggestionsLoading] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const [applicantProjects, setApplicantProjects] = useState<
    { projectId: string; propertyType: string; status: string }[]
  >([])
  // Persisted so the "not found" popup also survives a refresh.
  const [showNotFound, setShowNotFound] = useSessionState('applicantSearchNotFound', false)

  // Offer matching projects while the coordinator types. The short debounce
  // avoids sending a request for every keystroke, and AbortController prevents
  // an older response from replacing results for a newer query.
  useEffect(() => {
    const value = query.trim()
    if (!value) {
      setProjectSuggestions([])
      setSuggestionsLoading(false)
      setSuggestionsOpen(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setSuggestionsLoading(true)
      try {
        const response = await fetch(
          `/api/coordinator/projects/status?q=${encodeURIComponent(value)}`,
          { signal: controller.signal },
        )
        if (!response.ok) throw new Error('Could not load projects.')
        const body = await response.json()
        setProjectSuggestions((body.projects ?? []).slice(0, 8))
        setSuggestionsOpen(true)
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setProjectSuggestions([])
          setSuggestionsOpen(true)
        }
      } finally {
        if (!controller.signal.aborted) setSuggestionsLoading(false)
      }
    }, 300)

    return () => {
      window.clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  // Reset the search back to an empty state (used by the Cancel button).
  const clearSearch = () => {
    setQuery('')
    setResult(null)
    setError('')
    setNotice('')
    setApplicantProjects([])
    setProjectSuggestions([])
    setSuggestionsOpen(false)
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
    setSuggestionsOpen(false)
    const err = validateNIC(query)
    if (err) return (setError(err), setResult(null), undefined)
    setError('')
    setSearching(true)
    const res = await searchApplicantByNic(query)
    setResult(res)
    setSearching(false)
    // NIC entered but no matching loan applicant -> show the register popup.
    if (!res.found && !res.error) setShowNotFound(true)
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
          Look up a loan applicant by their NIC number.
        </p>
      </div>

      {/* Glass search card */}
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md sm:p-8">
        <form onSubmit={handleSearch}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Input
                aria-label="Search query"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setError('')
                  setSuggestionsOpen(true)
                }}
                onFocus={() => {
                  if (query.trim()) setSuggestionsOpen(true)
                }}
                onBlur={() => window.setTimeout(() => setSuggestionsOpen(false), 150)}
                placeholder="e.g. 199512345678 or 951234567V"
                error={error || undefined}
                icon={
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-5 w-5">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                }
              />
              {suggestionsOpen && (
                <div className="absolute z-30 mt-2 max-h-80 w-full overflow-hidden rounded-xl border border-emerald-300/25 bg-[#063f35] shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
                  {suggestionsLoading ? (
                    <div className="flex items-center gap-3 px-4 py-4 text-sm text-emerald-100/75">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200/30 border-t-gold-300" />
                      Searching matching records…
                    </div>
                  ) : projectSuggestions.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between border-b border-white/10 bg-black/10 px-4 py-2.5">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100/65">
                          Matching projects
                        </span>
                        <span className="rounded-full bg-gold-300/15 px-2 py-0.5 text-xs font-semibold text-gold-200">
                          {projectSuggestions.length}
                        </span>
                      </div>
                      <div className="max-h-64 overflow-y-auto p-1.5">
                        {projectSuggestions.map((project) => (
                          <button
                            key={project.projectId}
                            type="button"
                            className="group flex w-full items-center justify-between gap-4 rounded-lg border border-transparent px-3 py-3 text-left transition hover:border-emerald-300/20 hover:bg-emerald-300/10 focus:border-gold-300/40 focus:bg-emerald-300/10 focus:outline-none"
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                              setQuery(project.nic)
                              setError('')
                              setSuggestionsOpen(false)
                            }}
                          >
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold text-gold-300">
                                {project.projectId}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-emerald-100/70">
                                NIC: {project.nic}
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-emerald-100/50">
                                {project.propertyType || 'Property type not specified'}
                              </span>
                            </span>
                            <span className="flex shrink-0 items-center gap-2">
                              <span className="max-w-48 rounded-full border border-emerald-200/20 bg-emerald-300/10 px-2.5 py-1 text-right text-[11px] font-semibold text-emerald-100/85">
                                {project.status || 'Project Created'}
                              </span>
                              <span className="text-lg text-emerald-200/40 transition group-hover:translate-x-0.5 group-hover:text-gold-300">›</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="px-4 py-4">
                      <p className="text-sm font-semibold text-white">No matching records</p>
                      <p className="mt-1 text-xs text-emerald-100/60">
                        No projects match the NIC fragment “{query.trim()}”.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button type="submit" loading={searching} className="shrink-0">
              {searching ? 'Searching…' : 'Search'}
            </Button>
          </div>
          {!error && (
            <p className="mt-2 text-xs text-emerald-200/60">
              Accepts old format (9 digits + V/X) and new format (12 digits).
            </p>
          )}
        </form>
      </div>

      {/* Empty state (before a search) */}
      {!result && !suggestionsOpen && <SearchEmptyState />}

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
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() =>
                navigate('/coordinator/edit-applicant', { state: { applicant } })
              }
            >
              ✎ Edit details
            </Button>
            <Button type="button" variant="outline" fullWidth onClick={clearSearch}>
              Cancel
            </Button>
          </div>
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
              // Start a brand-new applicant: wipe any half-filled form so every
              // fresh registration opens empty (only the searched NIC carries in).
              sessionStorage.removeItem('registerApplicant:form')
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
