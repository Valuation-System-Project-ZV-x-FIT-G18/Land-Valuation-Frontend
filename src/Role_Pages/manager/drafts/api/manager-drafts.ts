// API for a manager's "Check Drafts" review workflow.

export type ManagerValuation = { valuationId: number; status: string; technicalOfficerId: string }
export type ManagerProject = {
  projectId: string
  ownerName: string
  location: string
  reviewStatus: string // draft | pending_l2 | rejected | pending_l1
  rejectReason: string
  valuations: ManagerValuation[]
}

// Friendly labels for the review states.
export const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  pending_l3: 'Awaiting L3 check',
  pending_l2: 'Submitted to L2',
  rejected_l3: 'Sent back to L3',
  rejected_l2: 'Sent back to L2',
  rejected_to_to: 'Sent back to Officer',
  rejected_to_coordinator: 'Rejected to Coordinator',
  pending_l1: 'Submitted to L1',
  locked: '🔒 Locked',
}
