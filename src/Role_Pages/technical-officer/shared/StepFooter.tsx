import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '@/Common_Pages/components/ui/Button'
import { STEPS, type TOStepId } from '@/Role_Pages/technical-officer/shared/TOWorkflowStepper'

// The action bar that closes every technical-officer step.
//
// "Move to the next step" used to appear differently on each screen: a modal on
// some, a full-width button on others, an inline link elsewhere, each with its
// own wording. It now always sits in the same place — bottom of the step, this
// step's own action on the left, Next on the right — so the officer never has
// to look for how to go on.
//
// The destination comes from the shared STEPS order rather than a route typed
// into each screen, so inserting or reordering a step cannot leave a stale link.

type Props = {
  current: TOStepId
  // Anything else this step needs in the bar (upload, analyse, print…).
  // Saving does NOT belong here — pass onSave instead.
  children?: ReactNode
  // Router state handed to the next step, normally the selected project so it
  // opens on the right record instead of the project picker.
  nextState?: unknown
  nextDisabled?: boolean
  // Shown when moving on is blocked, so a greyed-out button explains itself.
  hint?: string
  onNext?: () => void
  // Saving and moving on are one button, not two. Return false to stay put
  // when the save fails; anything else counts as success.
  onSave?: () => Promise<boolean | void> | boolean | void
  saving?: boolean
}

const StepFooter = ({
  current, children, nextState, nextDisabled = false, hint, onNext, onSave, saving = false,
}: Props) => {
  const navigate = useNavigate()
  const index = STEPS.findIndex((s) => s.id === current)
  const previous = index > 0 ? STEPS[index - 1] : undefined
  const next = STEPS[index + 1]
  if (!next && !onNext) return <>{children}</>

  const go = async () => {
    // A separate Save button next to Next made the officer press two things to
    // do one thing, and left "saved but not moved on" as a state to get stuck
    // in. Saving is now part of moving on, and a failed save keeps them here.
    if (onSave && (await onSave()) === false) return
    if (onNext) return onNext()
    navigate(next.to, nextState ? { state: nextState } : undefined)
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
      <div className="flex flex-wrap items-center gap-2">
        {/* Assigned Projects is the first step, so it has nothing to go back to
            and simply shows no back control. */}
        {previous && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => navigate(previous.to, nextState ? { state: nextState } : undefined)}
          >
            <span aria-hidden>&larr;</span> {previous.label}
          </Button>
        )}
        {children}
      </div>
      <div className="flex items-center gap-3">
        {nextDisabled && hint && <span className="text-xs text-emerald-200">{hint}</span>}
        <Button type="button" size="sm" disabled={nextDisabled} loading={saving} onClick={go}>
          {/* The label says whether pressing it also saves, so nothing is lost
              silently on a step that has unsaved work. */}
          {onSave ? 'Save & Next' : next ? `Next: ${next.label}` : 'Next'}{' '}
          <span aria-hidden>&rarr;</span>
        </Button>
      </div>
    </div>
  )
}

export default StepFooter
