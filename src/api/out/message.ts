import { http } from '../request'

export interface MessageItem {
  content: string
  created_at: string
  id: string
  role: 'user' | 'assistant'
  session_id: string
  meta_data: object
  result_data: object
}

export const messageApi = {
  // 获取用户列表
  getList: (sessionId: string, params?: { page?: number, page_size?: number }) =>
    http.get<{
      code: number
      items: MessageItem[]
      message: string
      page: number
      total: number
      total_pages: number
    }>(`/chat/sessions/${sessionId}/messages`, params),

  send: (params: any) => http.post<any>('/chat/sessions_chat', params),
}
