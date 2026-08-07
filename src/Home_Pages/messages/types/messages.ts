// Types for the in-system messaging feature.

// A person you can message (chosen after picking a role).
export type DirectoryUser = { userId: string; name: string }

// The other party in a conversation.
export type Partner = { userId: string; name: string; role: string }

// One chat message.
export type Message = {
  id: number
  senderId: string
  recipientId: string
  body: string
  fileName: string // original attachment name ('' if none)
  read: boolean
  createdAt: string
  formId?: number // set when this message represents a Project Details Form
}

// A Project Details Form sent from a coordinator to a loan applicant, to be
// filled in and sent back (same fields as the Create Project form, minus
// document uploads).
export type ProjectDetailsForm = {
  id: number
  coordinatorId: string
  applicantId: string
  status: 'Sent' | 'Submitted'
  data: Record<string, string>
  createdAt: string
  submittedAt: string | null
}

// A conversation summary in the inbox list.
export type Thread = {
  otherId: string
  name: string
  role: string
  lastBody: string
  lastAt: string
  unread: number
}
