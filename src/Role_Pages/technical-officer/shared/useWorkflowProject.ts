import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Keeps the active project connected as the officer moves between workflow pages.
// Navigation state handles the immediate transition; local storage also preserves
// the workspace when the page is refreshed.
export const useWorkflowProject = (storageKey: string) => {
  const location = useLocation()
  const [projectId, setProjectId] = useState<string | null>(() => {
    const navigationProjectId = (location.state as { projectId?: string } | null)?.projectId
    if (navigationProjectId) return navigationProjectId

    try {
      return localStorage.getItem(storageKey)
    } catch {
      return null
    }
  })

  const selectProject = (nextProjectId: string | null) => {
    setProjectId(nextProjectId)
    try {
      if (nextProjectId) localStorage.setItem(storageKey, nextProjectId)
      else localStorage.removeItem(storageKey)
    } catch {
      // Navigation state still provides continuity if storage is unavailable.
    }
  }

  useEffect(() => {
    const navigationProjectId = (location.state as { projectId?: string } | null)?.projectId
    if (navigationProjectId) selectProject(navigationProjectId)
  }, [location.state])

  return { projectId, selectProject }
}
