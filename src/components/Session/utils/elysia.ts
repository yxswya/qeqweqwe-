import { server } from '@/api/modules/session'

export interface Rag {
  id: string
  sessionId: string
  messageId: string
  indexVersion: string
  content: string
}

export interface Train {
  id: string
  sessionId: string
  messageId: string
  content: string
}

export interface Model {
  id: string
  externalId: string
}

export interface MessageResponse {
  id: string
  sessionId: string
  senderId: string
  replyToId: null | string
  content: string
  type: 'text' | 'image' | 'json'
  status: 'sending' | 'success' | 'error'
  createdAt: string
  sender: null | Record<string, any>
  rags: Rag[]
  trains: Train[]
  models: Model[]
}

export interface FileResponse {
  id: string
  sessionId: string
  messageId: string | null
  fileName: string
  fileUrl: string
  createdAt: Date
}

export interface SessionResponse {
  id: string
  userId: string
  title: string | null
  lastMessageAt: string
  createdAt: string
  messages: MessageResponse[]
  files: FileResponse[]
}

export async function getSessionMessages(sessionId: string): Promise<SessionResponse | undefined> {
  if (!sessionId)
    return

  // @ts-ignore
  return (await server.api.v1.session.chat({ sessionId }).get()).data
}
