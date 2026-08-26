import { Link } from 'react-router-dom'

// Horizontal progress header for the coordinator's valuation-creation flow.
// It sits at the top of each step page (Register Applicant -> Create Project
// -> New Valuation -> Assign Officers) and shows where the coordinator is in
// that sequence.
//
// This lives INSIDE the page (not the sidebar) on purpose: a sidebar is
// persistent navigation, while a stepper is task/process state. Each page
// passes its own `current` id, so the "done / current / upcoming" states
// reflect the real position in the flow — they are not guessed from the URL.

export type WorkflowStepId = 'register' | 'project' | 'valuation' | 'assign'

type Step = { id: WorkflowStepId; label: string; short: string; to: string; description: string }

const STEPS: Step[] = [
  { id: 'register', label: 'Select Applicant', short: 'Applicant', to: '/coordinator/applicants', description: 'Find or register the applicant' },
  { id: 'project', label: 'Create Project', short: 'Project', to: '/coordinator/projects/new', description: 'Enter the property and land details' },
  { id: 'valuation', label: 'Add Valuation', short: 'Valuation', to: '/coordinator/valuations/new', description: 'Enter the bank valuation request' },
  { id: 'assign', label: 'Assign Officer', short: 'Assign', to: '/coordinator/fleet-management/assign', description: 'Schedule and assign a technical officer' },
]

const markerClass = (state: 'done' | 'current' | 'upcoming') =>
  `relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition ${
    state === 'current'
      ? 'border-accent-300 bg-accent-400 text-emerald-950 shadow-[0_0_14px_rgba(30, 150, 200,0.45)]'
      : state === 'done'
        ? 'border-emerald-400 bg-emerald-500/25 text-emerald-200'
        : 'border-white/15 bg-surface text-emerald-100'
  }`

const labelClass = (state: 'done' | 'current' | 'upcoming') =>
  `mt-2 block text-center text-[11px] font-semibold leading-tight sm:text-xs ${
    state === 'current'
      ? 'text-accent-200'
      : state === 'done'
        ? 'text-emerald-100'
        : 'text-emerald-100'
  }`

const WorkflowStepper = ({ current }: { current: WorkflowStepId }) => {
  const currentIndex = STEPS.findIndex((s) => s.id === current)

  return (
    <nav
      aria-label="Valuation workflow"
      className="mx-auto mb-8 w-full max-w-3xl animate-fade-in"
    >
      <ol className="flex items-start">
        {STEPS.map((step, index) => {
          const state =
            index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
          const last = index === STEPS.length - 1
          const marker = (
            <span className={markerClass(state)}>{state === 'done' ? '✓' : index + 1}</span>
          )

          return (
            <li key={step.id} className={`flex items-center ${last ? '' : 'flex-1'}`}>
              <div className="flex w-20 flex-col items-center sm:w-28">
                <Link
                  to={step.to}
                  title={step.description}
                  aria-label={`${step.label}: ${step.description}`}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className="flex flex-col items-center rounded-lg outline-none transition hover:opacity-100 focus-visible:ring-2 focus-visible:ring-accent-400/60"
                >
                  {marker}
                  <span className={labelClass(state)}>
                    <span className="hidden sm:inline">{step.label}</span>
                    <span className="sm:hidden">{step.short}</span>
                  </span>
                </Link>
              </div>

              {!last && (
                <span
                  aria-hidden
                  className={`-mt-5 h-px flex-1 rounded transition ${
                    index < currentIndex ? 'bg-emerald-400/60' : 'bg-white/15'
                  }`}
                />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export default WorkflowStepper
