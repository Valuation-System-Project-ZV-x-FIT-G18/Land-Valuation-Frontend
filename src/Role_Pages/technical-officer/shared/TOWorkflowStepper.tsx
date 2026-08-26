import { Link } from 'react-router-dom'

// Horizontal progress header for the technical officer's report-building flow.
// It sits at the top of each step page (Assigned Projects -> Inspection Data ->
// Site Photos -> GPS & Map -> Analyse Nearby -> Generate Descriptions ->
// Create Draft) and shows where the officer is in that sequence.
//
// This lives INSIDE the page (not the sidebar) on purpose: a sidebar is
// persistent navigation, while a stepper is task/process state. Each page
// passes its own `current` id, so the "done / current / upcoming" states
// reflect the real position in the flow — they are not guessed from the URL.

export type TOStepId =
  | 'assigned'
  | 'inspection'
  | 'photos'
  | 'gps'
  | 'nearby'
  | 'descriptions'
  | 'draft'

type Step = { id: TOStepId; label: string; short: string; to: string }

// Exported so the step footer can work out what "next" means from the same
// single ordering the stepper draws, instead of each screen hard-coding the
// route that follows it.
export const STEPS: Step[] = [
  { id: 'assigned', label: 'Assigned Projects', short: 'Assigned', to: '/technical-officer/assignments' },
  { id: 'inspection', label: 'Inspection Data', short: 'Inspect', to: '/technical-officer/inspections' },
  { id: 'photos', label: 'Site Photos', short: 'Photos', to: '/technical-officer/site-photos' },
  { id: 'gps', label: 'GPS & Map', short: 'GPS', to: '/technical-officer/gps-map' },
  { id: 'nearby', label: 'Analyse Nearby', short: 'Nearby', to: '/technical-officer/nearby' },
  { id: 'descriptions', label: 'Descriptions', short: 'Descr.', to: '/technical-officer/descriptions' },
  { id: 'draft', label: 'Create Draft', short: 'Draft', to: '/technical-officer/draft' },
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
  `mt-2 block text-center text-[10px] font-semibold leading-tight sm:text-[11px] ${
    state === 'current'
      ? 'text-accent-200'
      : state === 'done'
        ? 'text-emerald-100'
        : 'text-emerald-100'
  }`

const TOWorkflowStepper = ({ current }: { current: TOStepId }) => {
  const currentIndex = STEPS.findIndex((s) => s.id === current)

  return (
    <nav
      aria-label="Technical officer workflow"
      className="mx-auto mb-8 w-full max-w-4xl animate-fade-in overflow-x-auto"
    >
      <ol className="flex min-w-[560px] items-start">
        {STEPS.map((step, index) => {
          const state =
            index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming'
          const last = index === STEPS.length - 1
          const navigable = state !== 'upcoming'

          const marker = (
            <span className={markerClass(state)}>{state === 'done' ? '✓' : index + 1}</span>
          )

          return (
            <li key={step.id} className={`flex items-center ${last ? '' : 'flex-1'}`}>
              <div className="flex w-16 flex-col items-center sm:w-24">
                {navigable ? (
                  <Link
                    to={step.to}
                    aria-current={state === 'current' ? 'step' : undefined}
                    className="flex flex-col items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
                  >
                    {marker}
                    <span className={labelClass(state)}>
                      <span className="hidden sm:inline">{step.label}</span>
                      <span className="sm:hidden">{step.short}</span>
                    </span>
                  </Link>
                ) : (
                  <div className="flex cursor-default flex-col items-center">
                    {marker}
                    <span className={labelClass(state)}>
                      <span className="hidden sm:inline">{step.label}</span>
                      <span className="sm:hidden">{step.short}</span>
                    </span>
                  </div>
                )}
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

export default TOWorkflowStepper
