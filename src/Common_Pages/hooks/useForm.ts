import { useEffect, useState } from 'react'

// A reusable form hook that handles the boring, repeated parts of every form:
//  - field state (optionally persisted to sessionStorage via `storageKey`)
//  - validate-on-blur and validate-on-submit
//  - submitting / server-error / success states
//  - per-field input transforms (e.g. keep only digits for a phone)
//
// Use it for any form so the component only describes its fields.

type Errors<T> = Partial<Record<keyof T, string>>

type UseFormOptions<T> = {
  initialValues: T
  validate: (values: T) => Errors<T>
  onSubmit: (values: T) => Promise<{ ok: boolean; error?: string }>
  storageKey?: string // persist to sessionStorage (survives refresh, clears on submit/close)
  transforms?: Partial<Record<keyof T, (value: string) => string>>
  successResetMs?: number // after success, hide the success message after this long
  excludeFromStorage?: (keyof T)[] // fields never written to storage (e.g. passwords)
}

export function useForm<T extends Record<string, string>>(opts: UseFormOptions<T>) {
  const {
    initialValues,
    validate,
    onSubmit,
    storageKey,
    transforms,
    successResetMs,
    excludeFromStorage,
  } = opts

  // Read any saved values synchronously so a refresh shows them immediately.
  const [values, setValues] = useState<T>(() => {
    if (storageKey) {
      try {
        const saved = sessionStorage.getItem(storageKey)
        if (saved !== null) {
          // Merge over the defaults so excluded fields (e.g. password) stay empty.
          return { ...initialValues, ...(JSON.parse(saved) as Partial<T>) }
        }
      } catch {
        /* ignore corrupt data */
      }
    }
    return initialValues
  })
  const [errors, setErrors] = useState<Errors<T>>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  // Persist values whenever they change (only when a storageKey is given).
  // Excluded fields (e.g. passwords) are stripped before saving.
  useEffect(() => {
    if (!storageKey) return
    try {
      const toSave: Partial<T> = { ...values }
      excludeFromStorage?.forEach((key) => delete toSave[key])
      sessionStorage.setItem(storageKey, JSON.stringify(toSave))
    } catch {
      /* ignore storage limits */
    }
  }, [storageKey, values, excludeFromStorage])

  // Optionally clear the success message after a delay.
  useEffect(() => {
    if (!submitted || !successResetMs) return
    const timer = setTimeout(() => setSubmitted(false), successResetMs)
    return () => clearTimeout(timer)
  }, [submitted, successResetMs])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const name = e.target.name as keyof T
    const transform = transforms?.[name]
    const value = transform ? transform(e.target.value) : e.target.value
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((p) => ({ ...p, [name]: undefined }))
    setServerError('')
  }

  // Validate just the field the user left.
  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const name = e.target.name as keyof T
    const found = validate(values)
    setErrors((p) => ({ ...p, [name]: found[name] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const found = validate(values)
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }
    setErrors({})
    setServerError('')
    setSubmitting(true)

    const result = await onSubmit(values)
    setSubmitting(false)
    if (!result.ok) {
      setServerError(result.error ?? 'Something went wrong. Please try again.')
      return
    }
    setValues(initialValues)
    // Clear persisted data immediately too. The save effect may NOT run if the
    // form navigates away on success (e.g. login -> dashboard) before it
    // re-renders, which would otherwise leave the old values in storage.
    if (storageKey) {
      try {
        sessionStorage.removeItem(storageKey)
      } catch {
        /* ignore */
      }
    }
    setSubmitted(true)
  }

  const isValid = Object.keys(validate(values)).length === 0

  return {
    values,
    errors,
    submitting,
    serverError,
    submitted,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
  }
}
