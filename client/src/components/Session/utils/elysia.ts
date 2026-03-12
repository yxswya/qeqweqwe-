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

export async function getSessionMessages(sessionId: string): Promise<MessageResponse[]> {
  if (!sessionId)
    return []

  return await fetch(
    `http://localhost:3002/api/v1/session/chat/${sessionId}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  )
    .then(res => res.json())
}
