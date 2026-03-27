import { server } from '@/api/modules/session'

// 后端返回的 RAG 数据结构
export interface Rag {
  id: string
  title: string
  messageId: string
  content: string
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
  sessionId: string // 关联的会话ID
}

export const ragApi = {
  // 获取所有知识库列表 - 后端 GET /rag/list
  getAllRags: async (): Promise<Rag[]> => {
    const response = await server.api.v1.rag.list.get()
    return (response.data || []) as Rag[]
  },

  // 根据会话ID获取知识库列表 - 后端 GET /rag/list/:sessionId
  getRagsBySessionId: async (sessionId: string): Promise<Rag[]> => {
    const response = await server.api.v1.rag.list({ sessionId }).get()
    return (response.data || []) as Rag[]
  },

  // RAG 聊天 - 后端 POST /rag/chat
  chat: async (params: { index_version: string, text: string }) => {
    const response = await server.api.v1.rag.chat.post(params)
    return response.data
  },
}
