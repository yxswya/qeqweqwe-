export interface Rag {
  id: string
  sessionId: string
  messageId: string
  indexVersion: string
  content: string
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
}

export interface FileResponse {
  id: string
  sessionId: string
  messageId: string
  fileName: string
  fileUrl: string
  createdAt: string
}

export interface SessionResponse {
  id: string
  title: string
  isGroup: boolean
  lastMessageAt: string
  createdAt: string
  messages: MessageResponse[]
  files: FileResponse[]
}

export async function getSessionMessages(sessionId: string): Promise<SessionResponse | undefined> {
  if (!sessionId)
    return

  return await fetch(
    `http://101.35.246.159:3002/api/v1/session/chat/${sessionId}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  )
    .then(res => res.json())
}
