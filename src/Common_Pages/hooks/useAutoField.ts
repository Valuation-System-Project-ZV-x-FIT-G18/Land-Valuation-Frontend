import { useEffect, useState } from 'react'

// Keeps a field auto-filled from a derived value (e.g. initials computed
// from first/last name) until the user edits it directly — after that,
// their edit is left alone. If the field already holds a value when this
// hook first mounts (e.g. an existing record), it's treated as already
// "touched" so it isn't silently overwritten.
export function useAutoField(
  derivedValue: string,
  value: string,
  setValue: (value: string) => void,
) {
  const [touched, setTouched] = useState(() => !!value.trim())

  useEffect(() => {
    if (touched) return
    setValue(derivedValue)
    // Only re-derive when the source value changes or the field becomes
    // untouched again — `setValue`/`touched` are stable across renders here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [derivedValue, touched])

  const onManualChange = (next: string) => {
    setTouched(true)
    setValue(next)
  }

  return { onManualChange }
}
