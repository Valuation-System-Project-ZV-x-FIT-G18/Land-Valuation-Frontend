// A 3-step progress indicator for the Create Project wizard.
// Full stepper on desktop; a compact "Step X of N — label" on mobile.

const steps = ['Search applicant', 'Applicant details', 'Project details']

const Stepper = ({ current }: { current: number }) => (
  <div>
    {/* Mobile */}
    <span className="rounded-full bg-gold-400/15 px-3 py-1 text-xs font-semibold text-gold-200 md:hidden">
      Step {current} of {steps.length} — {steps[current - 1]}
    </span>

    {/* Desktop */}
    <ol className="hidden items-center md:flex">
      {steps.map((label, i) => {
        const step = i + 1
        const done = step < current
        const active = step === current
        return (
          <li key={label} className="flex items-center">
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition ${
                active
                  ? 'bg-gold-400 text-emerald-950 ring-4 ring-gold-400/20'
                  : done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-emerald-100/60'
              }`}
            >
              {done ? '✓' : step}
            </span>
            <span
              className={`ml-2 text-sm font-medium ${active ? 'text-white' : 'text-emerald-100/55'}`}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <span className={`mx-3 h-px w-8 ${done ? 'bg-emerald-500' : 'bg-white/15'}`} />
            )}
          </li>
        )
      })}
    </ol>
  </div>
)

export default Stepper
