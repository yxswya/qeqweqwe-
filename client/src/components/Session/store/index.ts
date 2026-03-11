import type { Message } from '@/components/Session/types.ts'
import type { ClarificationQuestion } from '@/components/WorkFlow/types'
import { create } from 'zustand'
import { app } from '@/components/Session/common.ts'
import { getSessionMessages } from '../utils/elysia'

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

export interface SSENormalMessage {
  type: 'NEW_BOT_MESSAGE' | 'UPDATE_BOT_MESSAGE'
  data: {
    id: string
    content: Message
  }
}

export const useStore = create<{
  sessionId: string
  status: 'loading' | 'input' | 'none' | 'questions' // 当前操作状态
  // messages: Array<ApiResponse & { id: string }> // 消息列表
  messages: Message[]
  clarificationQuestions: ClarificationQuestion[]
  ragBuild: any[]
  ragBuildProgress: RagBuildProgress | null
  ragBuildLogs: RagBuildLogs | null
  fetchMessage: (text: string) => Promise<void>
  initConversation: (sessionId: string | undefined) => void
  getMessages: () => Promise<void>
  createSession: () => Promise<string>
  clearSession: () => void
  fetchRagBuild: () => Promise<void>
  setStatus: (obj: Partial<{
    messages: Message[]
    status: 'loading' | 'input' | 'none' | 'questions' // 当前操作状态
    clarificationQuestions: ClarificationQuestion[]
  }>) => void

  addMessage: (message: Message) => void
}>((set, get) => ({
  sessionId: '',
  status: 'input',
  messages: [],
  clarificationQuestions: [],
  ragBuild: [],
  ragBuildProgress: null,
  ragBuildLogs: null,

  addMessage(message) {
    const { messages } = get()
    const index = messages.findIndex(m => m.id === message.id)
    if (index >= 0) {
      // 如果存在，更新该消息
      const newMessages = [...messages]
      newMessages[index] = message
      set({ messages: newMessages })
    }
    else {
      // 如果不存在，添加到末尾
      set({
        messages: [...messages, message],
      })
    }
  },
  clearSession() {
    set({
      messages: [],
      status: 'input',
      sessionId: undefined,
      clarificationQuestions: [],
    })
  },

  setStatus(obj) {
    set(obj)
  },
  initConversation(sessionId) {
    const { fetchRagBuild, getMessages, clearSession } = get()
    if (!sessionId) {
      clearSession()
      return
    }

    set({
      sessionId,
    })

    fetchRagBuild().catch(console.error)
    getMessages().catch(console.error)

    // const sse = SessionSSE.getInstance(sessionId)

    // const sse = SSEManager.getInstance()
    //
    // // 1. 建立连接
    // sse.connect(`http://localhost:3000/api/conversations/${sessionId}/sse`, {
    //   withCredentials: true, // 允许携带 Cookie
    // })
    //
    // // 2. 监听默认的 message 消息
    // const handleNormalMessage = (data: SSENormalMessage) => {
    //   const { messages } = get()
    //   console.log('Received message:', data) // 已经自动解析过 JSON
    //   if (data.type === 'UPDATE_BOT_MESSAGE') {
    //     const findIndex = messages.findIndex(el => el.id === data.data.content.id)
    //     messages.splice(findIndex, 1, data.data.content)
    //
    //     if (data.data.content.messageType === 'ASK_MORE_INFO_COMPLETENESS') {
    //       const content = JSON.parse(data.data.content.content)
    //       set({
    //         status: 'questions',
    //         clarificationQuestions: content.answer.clarification_questions,
    //         messages: [...messages],
    //       })
    //     }
    //     else if (data.data.content.messageType === 'ASK_MORE_INFO_INTENT') {
    //       // const content = JSON.parse(data.data.content.content)
    //       set({
    //         status: 'input',
    //         clarificationQuestions: [],
    //         messages: [...messages],
    //       })
    //     }
    //     else {
    //       set({
    //         status: 'none',
    //         messages: [...messages],
    //       })
    //     }
    //   }
    //   else {
    //
    //   }
    // }
    // sse.on('message', handleNormalMessage)
    //
    // // 3. 监听后端的自定义事件 (例如后端发送的 event: 'update')
    // const handleUpdateEvent = (data: any) => {
    //   console.log('Received update event:', data)
    // }
    // sse.on('update', handleUpdateEvent)

    // if (!sse) {
    //   // 1. 前端进入页面时，先建立 SSE 长连接
    //   sse = new EventSource(`http://localhost:3000/api/conversations/${sessionId}/sse`, {
    //     withCredentials: true,
    //   })
    // }
    //
    // // 2. 监听后台推过来的消息
    // sse.onmessage = (event) => {
    //   const { messages } = get()
    //   const payload = JSON.parse(event.data)
    //   console.log('payload', payload)
    //   if (payload.type === 'NEW_BOT_MESSAGE') {
    //     console.log('收到 AI 回复:', payload.data.content)
    //
    //     const message = payload.data.content as Message
    //     let content: (ApiResponse | string)
    //
    //     try {
    //       content = JSON.parse(message.content)
    //     }
    //     catch {
    //       content = message.content
    //     }
    //
    //     // 查找消息索引，存在则替换，不存在则添加
    //     const messageIndex = messages.findIndex(m => m.id === message.id)
    //     const newMessages = [...messages]
    //     if (messageIndex >= 0) {
    //       newMessages[messageIndex] = { ...message }
    //     }
    //     else {
    //       newMessages.push({ ...message })
    //     }
    //
    //     if (typeof content === 'string' && content[0] === '{') {
    //       if (
    //         hasAnswer(content)
    //         && Array.isArray(content.answer?.clarification_questions)
    //         && content.answer?.clarification_questions.length > 0
    //       ) {
    //         set({
    //           status: 'questions',
    //           clarificationQuestions: content.answer.clarification_questions,
    //           messages: newMessages,
    //         })
    //       }
    //       else {
    //         set({
    //           status: 'input',
    //           clarificationQuestions: [],
    //           messages: newMessages,
    //         })
    //       }
    //     }
    //     else {
    //       set({
    //         status: 'none',
    //         clarificationQuestions: [],
    //         messages: newMessages,
    //       })
    //     }
    //   }
    //   else if (payload.type === 'NEW_BOT_MESSAGE_UPDATE') {
    //     const id = payload.data.id
    //
    //     const messageIndex = messages.findIndex(msg => msg.id === id)
    //     messages[messageIndex] = payload.data.content.result
    //     set({ messages: [...messages] })
    //   }
    //   else if (payload.type === 'rag_build_progress') {
    //     // RAG 构建进度更新
    //     console.log('RAG 构建进度:', payload.data)
    //     set({ ragBuildProgress: payload.data })
    //   }
    //   else if (payload.type === 'rag_build_logs') {
    //     // RAG 构建日志更新
    //     console.log('RAG 构建日志:', payload.data)
    //     set({ ragBuildLogs: payload.logs })
    //   }
    //   else if (payload.type === 'rag_build_complete') {
    //     // RAG 构建完成
    //     console.log('RAG 构建完成:', payload.data)
    //     set({
    //       ragBuildProgress: {
    //         job_id: payload.data.job_id,
    //         state: 'succeeded',
    //         progress: 1,
    //         message: '构建完成',
    //       },
    //     })
    //     fetchRagBuild()
    //   }
    //   else if (payload.type === 'rag_build_error') {
    //     // RAG 构建失败
    //     console.error('RAG 构建失败:', payload.data)
    //     set({
    //       ragBuildProgress: {
    //         job_id: payload.data.job_id,
    //         state: 'failed',
    //         progress: 0,
    //         message: payload.data.message,
    //       },
    //     })
    //   }
    //   else if (payload.type === 'ERROR') {
    //     console.error('出错了')
    //   }
    // }
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
    const response = await getSessionMessages(sessionId)
    // const messages = await app.api.conversations({ conversationId: sessionId }).messages.get()

    // const { data } = await fetch(`http://localhost:3000/api/conversations/${sessionId}/messages`, {
    //   method: 'GET',
    //   credentials: 'include', // 关键设置
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    // })
    //   .then(res => res.json())

    console.log(response)
    // console.log(messages.data)
    set({ messages: [...response] })
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
    const result = await app.api.conversations({
      id: sessionId,
    }).messages.post({
      content,
      messageType: 'text',
    })

    if (result.data) {
      const { userMessage, botMessage } = result.data
      console.log('Received message:', userMessage, botMessage)
      set({
        messages: [...messages, userMessage, botMessage],
      })
    }
  },
}))

export default useStore
