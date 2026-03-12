import type { ClarificationQuestion } from './types'
import type { Message } from '@/components/Session/types.ts'
import { create } from 'zustand'

// let sse: EventSource

// export interface Message {
//   content: string
//   conversationId: string
//   userMessageId: string | undefined
//   createdAt: string
//   id: string
//   messageType: string
//   messageStatus?: 'rag' | 'train' | 'normal'
//   sender: null | string
//   senderId: string | null
// }

// RAG 构建进度状态
export interface RagBuildProgress {
  job_id: string
  state: 'pending' | 'running' | 'succeeded' | 'failed'
  progress: number
  message: string
}

// RAG 构建日志状态
export interface RagBuildLogs {
  job_id: string
  logs: string[]
}

export const useStore = create<{
  sessionId: string | undefined
  status: 'loading' | 'input' | 'none' | 'questions' // 当前操作状态
  // messages: Array<ApiResponse & { id: string }> // 消息列表
  messages: Message[]
  clarificationQuestions: ClarificationQuestion[]
  ragBuild: any[]
  ragBuildProgress: RagBuildProgress | null
  ragBuildLogs: RagBuildLogs | null
  fetchMessage: (text: string) => Promise<void>
  clearStatus: () => void
  initSession: (sessionId: string) => void
  getMessages: () => Promise<void>
  createSession: () => Promise<string>
  clearSession: () => void
  fetchRagBuild: () => void
}>((set, get) => ({
  sessionId: undefined,
  status: 'input',
  messages: [],
  clarificationQuestions: [],
  ragBuild: [],
  ragBuildProgress: null,
  ragBuildLogs: null,

  clearSession() {
    set({
      messages: [],
      status: 'input',
      sessionId: undefined,
      clarificationQuestions: [],
    })
  },
  initSession(sessionId) {
    const { fetchRagBuild } = get()
    if (!sessionId)
      return

    set({
      sessionId,
    })

    fetchRagBuild()
  },

  async createSession() {
    // const response = await fetch('http://localhost:3000/api/conversations', {
    //   method: 'POST',
    //   credentials: 'include',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ participantIds: [], title: `会话${Date.now()}` }),
    // })
    //   .then(res => res.json())

    // const { conversationId } = response.data
    // set({
    //   sessionId: conversationId,
    // })

    // return conversationId
  },

  async getMessages() {
    // const { sessionId } = get()
    // if (!sessionId)
    //   return

    // const { data } = await fetch(`http://localhost:3000/api/conversations/${sessionId}/messages`, {
    //   method: 'GET',
    //   credentials: 'include', // 关键设置
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })
    //   .then(res => res.json())

    // set({
    //   messages: data,
    // })
  },

  async fetchRagBuild() {
    // const { sessionId } = get()
    // if (!sessionId)
    //   return

    // const { data } = await fetch(`http://localhost:3000/api/conversations/${sessionId}/rag/builds`, {
    //   method: 'GET',
    //   credentials: 'include', // 关键设置
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })
    //   .then(res => res.json())

    // set({
    //   ragBuild: data,
    // })
  },

  async fetchMessage(content) {
    // const { messages, sessionId } = get()
    // if (!sessionId)
    //   return

    // set({ status: 'loading' })
    // const response: { data: Message, botMessageId: string } = await fetch(`http://localhost:3000/api/conversations/${sessionId}/messages`, {
    //   method: 'POST',
    //   credentials: 'include', // 关键设置
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ content, messageType: 'text' }),
    // })
    //   .then(res => res.json())

    // set({
    //   messages: [...messages, response.data, {
    //     content: 'loading',
    //     conversationId: sessionId,
    //     userMessageId: '',
    //     createdAt: '',
    //     id: response.botMessageId,
    //     messageType: 'system',
    //     sender: '',
    //     senderId: 'system-bot-id',
    //   }],
    // })
  },

  clearStatus() {
  },
}))

export default useStore
