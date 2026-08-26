import { useEffect, useState } from 'react'

// Persistent state shared by every tab in the same browser profile.
export function useLocalState<T>(key: string, initialValue: T) {
  const read = () => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? initialValue : JSON.parse(saved) as T
    } catch {
      return initialValue
    }
  }
  const [value, setValue] = useState<T>(read)

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value))
  }, [key, value])

  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== key) return
      try { setValue(event.newValue === null ? initialValue : JSON.parse(event.newValue) as T) }
      catch { setValue(initialValue) }
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [key, initialValue])

  return [value, setValue] as const
}
