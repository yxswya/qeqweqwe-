import type { ApiResponse, ClarificationQuestion } from './types'
import { create } from 'zustand'
import { hasAnswer } from './types'

let sse: EventSource

export interface Message {
  content: string
  conversationId: string
  userMessageId: string | undefined
  createdAt: string
  id: string
  messageType: string
  sender: null | string
  senderId: string
}

export const useStore = create<{
  sessionId: string | undefined
  status: 'loading' | 'input' | 'none' | 'questions' // 当前操作状态
  // messages: Array<ApiResponse & { id: string }> // 消息列表
  messages: Message[]
  clarificationQuestions: ClarificationQuestion[]
  ragBuild: any[]
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

    if (!sse) {
      // 1. 前端进入页面时，先建立 SSE 长连接
      sse = new EventSource(`http://localhost:3000/api/conversations/${sessionId}/sse`, {
        withCredentials: true,
      })
    }

    // 2. 监听后台推过来的消息
    sse.onmessage = (event) => {
      const { messages } = get()
      const payload = JSON.parse(event.data)
      if (payload.type === 'NEW_BOT_MESSAGE') {
        console.log('收到 AI 回复:', payload.data.content)
        // 更新 UI...

        const message = payload.data.content as Message
        let content: (ApiResponse | string)

        try {
          content  = JSON.parse(message.content)
        } catch {
          content = message.content
        }

        // 查找消息索引，存在则替换，不存在则添加
        const messageIndex = messages.findIndex(m => m.id === message.id)
        const newMessages = [...messages]
        if (messageIndex >= 0) {
          newMessages[messageIndex] = { ...message }
        }
        else {
          newMessages.push({ ...message })
        }

        if (
          hasAnswer(content)
          && Array.isArray(content.answer?.clarification_questions)
          && content.answer?.clarification_questions.length > 0
        ) {
          set({
            status: 'questions',
            clarificationQuestions: content.answer.clarification_questions,
            messages: newMessages,
          })
        }
        else if (
          typeof content !== 'string'
          && !hasAnswer(content)
          && content.workflow_hint.stage === 'need_more_info'
        ) {
          set({
            status: 'input',
            clarificationQuestions: [],
            messages: newMessages,
          })
        }
        else {
          set({
            status: 'none',
            clarificationQuestions: [],
            messages: newMessages,
          })
        }
      }
      else if (payload.type === 'ERROR') {
        console.error('出错了')
      }
    }
  },

  async createSession() {
    const response = await fetch('http://localhost:3000/api/conversations', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participantIds: [], title: `会话${Date.now()}` }),
    })
      .then(res => res.json())

    const { conversationId } = response.data
    set({
      sessionId: conversationId,
    })

    return conversationId
  },

  async getMessages() {
    const { sessionId } = get()
    if (!sessionId)
      return

    const { data } = await fetch(`http://localhost:3000/api/conversations/${sessionId}/messages`, {
      method: 'GET',
      credentials: 'include', // 关键设置
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())

    set({
      messages: data,
    })
  },

  async fetchRagBuild() {
    const { sessionId } = get()
    if (!sessionId)
      return

    const { data } = await fetch(`http://localhost:3000/api/conversations/${sessionId}/rag/builds`, {
      method: 'GET',
      credentials: 'include', // 关键设置
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())

    set({
      ragBuild: data,
    })
  },

  async fetchMessage(content) {
    const { messages, sessionId } = get()
    if (!sessionId)
      return

    set({ status: 'loading' })
    const response: { data: Message, botMessageId: string } = await fetch(`http://localhost:3000/api/conversations/${sessionId}/messages`, {
      method: 'POST',
      credentials: 'include', // 关键设置
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, messageType: 'text' }),
    })
      .then(res => res.json())

    set({
      messages: [...messages, response.data, {
        content: 'loading',
        conversationId: sessionId,
        userMessageId: '',
        createdAt: '',
        id: response.botMessageId,
        messageType: 'system',
        sender: '',
        senderId: 'system-bot-id',
      }],
    })
  },

  clearStatus() {
  },
}))

export default useStore
