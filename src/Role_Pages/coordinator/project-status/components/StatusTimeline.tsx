// A vertical progress timeline for a valuation's 14-step lifecycle.
//  done    -> green ✓ (completed)
//  current -> blue ● (the step happening now)
//  waiting -> gray ○ (not reached yet)

export type StepState = 'done' | 'current' | 'waiting'
export type TimelineStep = { label: string; state: StepState }

const StatusTimeline = ({ steps }: { steps: TimelineStep[] }) => (
  <ol className="relative">
    {steps.map((step, i) => {
      const last = i === steps.length - 1
      const { state } = step
      return (
        <li key={step.label} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Connector line — green once this step is done. */}
          {!last && (
            <span
              className={`absolute left-[15px] top-8 h-full w-0.5 ${
                state === 'done' ? 'bg-emerald-400/60' : 'bg-white/10'
              }`}
            />
          )}

          {/* Step marker */}
          <span
            className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
              state === 'done'
                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                : state === 'current'
                  ? 'border-sky-400 bg-sky-500/25 text-sky-200 ring-4 ring-sky-400/20'
                  : 'border-white/20 bg-white/5 text-emerald-200/40'
            }`}
          >
            {state === 'done' ? '✓' : i + 1}
          </span>

          {/* Step label + state */}
          <div className="pt-1">
            <p
              className={`text-sm font-semibold ${
                state === 'done'
                  ? 'text-emerald-100'
                  : state === 'current'
                    ? 'text-sky-200'
                    : 'text-emerald-100/40'
              }`}
            >
              {step.label}
            </p>
            <p
              className={`text-xs ${
                state === 'current' ? 'text-sky-300/70' : 'text-emerald-200/40'
              }`}
            >
              {state === 'done' ? 'Done' : state === 'current' ? 'Current step' : 'Waiting'}
            </p>
          </div>
        </li>
      )
    })}
  </ol>
)

export default StatusTimeline
