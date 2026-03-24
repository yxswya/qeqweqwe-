import { http } from '@/api'

export interface Rag {
  id: string
  sessionId: string
  title: string
  messageId: string
  indexVersion: string
  content: string
  createdAt: string
}

export interface RagListResponse {
  code: number
  message: string
  data: Rag[]
}

export const ragApi = {
  getLocalRags: (sessionId: string) =>
    http.get<RagListResponse>(`/rag/local/${sessionId}`),

  getAllRags: () =>
    http.get<RagListResponse>('/rag/all'),
}
