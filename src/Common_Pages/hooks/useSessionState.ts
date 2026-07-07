import { useState, useEffect } from 'react'

// A reusable hook that works like useState, but also remembers the value in
// the browser's sessionStorage.
//
// Why sessionStorage?
//  - It SURVIVES a page refresh (so half-filled forms aren't lost).
//  - It is automatically CLEARED when the tab/window is closed.
//
// The saved value is read SYNCHRONOUSLY when state initializes (lazy initial
// state), so on a refresh the form shows the saved data immediately — no flash
// of an empty form and no race.

export function useSessionState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = sessionStorage.getItem(key)
      return saved !== null ? (JSON.parse(saved) as T) : initialValue
    } catch {
      return initialValue // unreadable/corrupt value -> start fresh
    }
  })

  // Save on every change.
  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value))
    } catch {
      // ignore storage errors (e.g. private mode limits)
    }
  }, [key, value])

  return [value, setValue] as const
}
