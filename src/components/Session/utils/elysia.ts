import { server } from '@/api/modules/session'

// ========================================
// 基础类型定义（与后端 schema 保持一致）
// ========================================

/** 消息内容类型 */
export type MessageContentType =
  | { type: 'text', text: string }
  | { type: 'loading', status: string }
  | { type: 'response', data: any }
  | { type: 'rag_build_response', data: any }
  | { type: 'model_train_response', data: { train: any, register: any } }
  | { type: 'error', message: string }
  | Record<string, any>

/** 消息（与后端 SelectMessage 保持一致） */
export interface SelectMessage {
  id: string
  sessionId: string
  senderId: string
  content: MessageContentType
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/** 会话（与后端 SelectSession 保持一致） */
export interface SelectSession {
  id: string
  userId: string
  title: string
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// 后端消息响应类型
export interface MessageResponse extends SelectMessage {
  rags?: { id: string, title: string, content: string }[]
  models?: { id: string, title: string, content: string }[]
}

// 后端文件响应类型
export interface FileResponse {
  id: string
  sessionId: string
  filename: string
  location: string
  createdAt: Date
}

// 后端会话详情响应类型
export interface SessionDetailResponse extends SelectSession {
  messages?: MessageResponse[]
  governanceFiles?: FileResponse[]
}

// 获取会话详情（包含消息和文件）
export async function getSessionDetail(sessionId: string): Promise<SessionDetailResponse | undefined> {
  if (!sessionId)
    return

  const response = await server.api.v1.session.detail({ sessionId }).get()
  return response.data
}

// 获取会话消息列表
export async function getSessionMessages(sessionId: string): Promise<{ messages: MessageResponse[], files: FileResponse[] } | undefined> {
  if (!sessionId)
    return

  const sessionDetail = await getSessionDetail(sessionId)
  if (!sessionDetail)
    return

  return {
    messages: (sessionDetail.messages as MessageResponse[]) || [],
    files: (sessionDetail.governanceFiles as FileResponse[]) || [],
  }
}
