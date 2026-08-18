import type { Assignment } from '@/Role_Pages/technical-officer/assignments/api/assignments'

export type WorkflowSelection = { assignment?: Assignment; projectId: string }

const key = (userId: string) => `to-workflow-selection:${userId}`

export const loadWorkflowSelection = (userId: string): WorkflowSelection | null => {
  if (!userId) return null
  try {
    const value = JSON.parse(localStorage.getItem(key(userId)) ?? 'null') as WorkflowSelection | null
    return value?.projectId ? value : null
  } catch {
    localStorage.removeItem(key(userId))
    return null
  }
}

export const saveWorkflowSelection = (userId: string, selection: WorkflowSelection) => {
  if (userId && selection.projectId) localStorage.setItem(key(userId), JSON.stringify(selection))
}
