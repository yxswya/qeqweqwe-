import type { ChatResponse } from '@/api/modules'
import { http } from '@/api'

export interface SuccessList<T> {
  code: number
  items: T
  message: string
  page: number
  page_size: number
  total: number
  total_pages: number
}

export const sessionApi = {
  async createSession() {},
  async getSession(id: string, params: { page: number, page_size: number }) {
    return await http.get<SuccessList<ChatResponse[]>>(
      `/chat/sessions/${id}/messages`,
      params,
    )
  },
}
