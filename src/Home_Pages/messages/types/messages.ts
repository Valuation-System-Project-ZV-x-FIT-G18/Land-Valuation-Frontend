// Types for the in-system messaging feature.

// A person returned by the searchable user directory.
export type DirectoryUser = { userId: string; name: string; role: string; email: string }

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
