import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '@/Common_Pages/components/auth/useAuth'

type DraftField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
type Draft = Record<string, string | boolean>

const fieldId = (field: DraftField) => field.name || field.id

const canPersist = (field: DraftField) => {
  const readOnly = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement
    ? field.readOnly
    : false
  if (!fieldId(field) || field.disabled || readOnly || field.dataset.noPersist === 'true') return false
  if (!(field instanceof HTMLInputElement)) return true
  return !['password', 'file', 'hidden', 'submit', 'button', 'reset'].includes(field.type)
}

const fieldsOnPage = () =>
  Array.from(document.querySelectorAll<DraftField>('input, select, textarea')).filter(canPersist)

const setNativeValue = (field: DraftField, value: string | boolean) => {
  if (field instanceof HTMLInputElement && (field.type === 'checkbox' || field.type === 'radio')) {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked')?.set
    setter?.call(field, field.type === 'radio' ? field.value === value : Boolean(value))
  } else {
    const prototype = field instanceof HTMLInputElement
      ? HTMLInputElement.prototype
      : field instanceof HTMLSelectElement
        ? HTMLSelectElement.prototype
        : HTMLTextAreaElement.prototype
    const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set
    setter?.call(field, String(value))
  }
  field.dispatchEvent(new Event('input', { bubbles: true }))
  field.dispatchEvent(new Event('change', { bubbles: true }))
}

// Saves drafts for internal forms by user + URL. Passwords and files are never
// stored. Native input/change events keep this compatible with controlled React
// fields without requiring every page to implement its own persistence hook.
const FormDraftPersistence = () => {
  const { user } = useAuth()
  const location = useLocation()
  const storageKey = `form-draft:${user?.userId ?? 'anonymous'}:${location.pathname}${location.search}`

  useEffect(() => {
    let restoring = true
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const draft = JSON.parse(saved) as Draft
        // Wait until the routed page and its controlled fields have mounted.
        requestAnimationFrame(() => {
          fieldsOnPage().forEach((field) => {
            const key = fieldId(field)
            if (Object.prototype.hasOwnProperty.call(draft, key)) setNativeValue(field, draft[key])
          })
          restoring = false
        })
      } else {
        restoring = false
      }
    } catch {
      localStorage.removeItem(storageKey)
      restoring = false
    }

    const save = (event: Event) => {
      if (restoring || !(event.target instanceof HTMLElement)) return
      const changed = event.target as DraftField
      if (!canPersist(changed)) return
      const draft: Draft = {}
      fieldsOnPage().forEach((field) => {
        const key = fieldId(field)
        if (field instanceof HTMLInputElement && field.type === 'radio') {
          if (field.checked) draft[key] = field.value
        } else if (field instanceof HTMLInputElement && field.type === 'checkbox') {
          draft[key] = field.checked
        } else {
          draft[key] = field.value
        }
      })
      localStorage.setItem(storageKey, JSON.stringify(draft))
    }

    const clearAfterReset = () => localStorage.removeItem(storageKey)
    document.addEventListener('input', save, true)
    document.addEventListener('change', save, true)
    document.addEventListener('reset', clearAfterReset, true)
    return () => {
      document.removeEventListener('input', save, true)
      document.removeEventListener('change', save, true)
      document.removeEventListener('reset', clearAfterReset, true)
    }
  }, [storageKey])

  return null
}

export default FormDraftPersistence
