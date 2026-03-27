import type { FileResponse, MessageResponse } from '../utils/elysia'
import type { ActionType, ApiResponse, ClarificationQuestion, Message, MessageContent } from '@/components/Session/types'

import { fetchEventSource } from '@microsoft/fetch-event-source'
import { create } from 'zustand'
import { server } from '@/api/modules/session'
import { getAccessToken } from '@/auth'
import { hasAnswer, hasIntent, isResponseContent } from '@/components/Session/types'
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

// SSE 连接管理状态
interface SSEConnection {
  controller: AbortController
  fetchPromise: Promise<void> | null
}

export const useStore = create<{
  sessionId: string
  status: 'loading' | 'input' | 'none' | 'questions' // 当前操作状态
  actions: ActionType[]

  messages: Message[]
  files: FileResponse[]
  clarificationQuestions: ClarificationQuestion[]
  ragBuild: any[]
  ragBuildProgress: RagBuildProgress | null
  ragBuildLogs: RagBuildLogs | null
  fetchMessage: (text: string) => Promise<void>
  initConversation: (sessionId: string | undefined) => void
  getMessages: () => Promise<void>
  clearSession: () => void
  setStatus: (obj: Partial<{
    files: FileResponse[]
    actions: ActionType[]
    sessionId: string
    messages: Message[]
    status: 'loading' | 'input' | 'none' | 'questions' // 当前操作状态
    clarificationQuestions: ClarificationQuestion[]
  }>) => void

  addMessage: (message: Message) => void
  statusText: string
  setStatusText: (text: string) => void
  parseContent: (content: string) => void
  setSessionStatus: (data: MessageResponse) => void

  // SSE 连接管理
  sseConnection: SSEConnection | null
  disconnectSSE: () => void
}>((set, get) => ({
  sessionId: '',
  status: 'input',
  actions: [],
  messages: [],
  files: [],
  clarificationQuestions: [],
  ragBuild: [],
  ragBuildProgress: null,
  ragBuildLogs: null,
  sseConnection: null,

  statusText: '',
  setStatusText: (text) => {
    set({
      statusText: text,
    })
  },

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
    const { disconnectSSE } = get()
    // 断开 SSE 连接
    disconnectSSE()
    set({
      messages: [],
      status: 'input',
      sessionId: '',
      clarificationQuestions: [],
    })
  },

  setStatus(obj) {
    set(obj)
  },

  // 断开 SSE 连接
  disconnectSSE() {
    const { sseConnection } = get()
    if (sseConnection?.controller) {
      sseConnection.controller.abort()
      console.log('🔌 SSE 连接已主动断开')
    }
    set({ sseConnection: null })
  },

  initConversation(sessionId) {
    const { getMessages, clearSession, parseContent, disconnectSSE, sseConnection } = get()
    if (!sessionId) {
      clearSession()
      return
    }

    // 如果已有连接且 sessionId 不同，先断开旧连接
    if (sseConnection && get().sessionId !== sessionId) {
      disconnectSSE()
    }

    set({ sessionId })

    // 只有在没有活跃连接时才创建新连接
    if (!sseConnection) {
      // 添加时间戳破坏缓存
      const cacheBuster = Date.now()
      const controller = new AbortController()

      console.log('开始链接')
      const fetchPromise = fetchEventSource(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/chat/sse/${sessionId}?_t=${cacheBuster}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'Authorization': `Bearer ${getAccessToken()}`,
          },
          signal: controller.signal,

          // 连接成功打开时触发
          async onopen() {
            console.log('✅ SSE 连接已建立', { sessionId, timestamp: cacheBuster })
          },

          // 接收到服务端消息时触发
          onmessage(msg) {
            const { data, event } = msg

            if (event === 'message') {
              console.log(event, '///', data)
              parseContent(data)
            }
          },

          // 连接关闭时触发
          onclose() {
            console.log('🔌 SSE 连接已关闭')
            set({ sseConnection: null })
          },

          // 发生错误时触发
          onerror(err) {
            console.error('⚠️ SSE 发生异常:', err)
            set({ sseConnection: null })
            throw err
          },
        },
      )

      set({
        sseConnection: {
          controller,
          fetchPromise,
        },
      })
    }

    getMessages().catch(console.error)
  },

  async getMessages() {
    const { sessionId, setSessionStatus, clearSession } = get()

    if (!sessionId) {
      clearSession()
      return
    }

    const response = await getSessionMessages(sessionId)

    if (!response)
      return

    const { messages, files } = response
    set({
      messages: [...messages],
      files: [...files],
    })
    setSessionStatus(messages.at(-1)!)
  },

  async fetchMessage(text) {
    console.log('fasong ')
    const { sessionId, setStatus } = get()
    setStatus({
      status: 'loading',
    })

    // 调用后端 POST /chat/completion/:sessionId
    server.api.v1.chat.completion({ sessionId }).post({ prompt: text }).then((response) => {
      console.log('back', response)
      if (response.data) {
        // 处理响应...
      }
    })
  },
  setSessionStatus(data: MessageResponse | undefined) {
    console.log('data', data)
    if (!data)
      return

    const { setStatus } = get()
    const sessionId = data.sessionId
    const content = data.content as MessageContent

    // 处理响应类型内容
    if (isResponseContent(content)) {
      const responseData = content.data as ApiResponse

      if (hasAnswer(responseData)) {
        if (responseData.answer.clarification_questions.length > 0) {
          setStatus({
            sessionId,
            status: 'questions',
            clarificationQuestions: responseData.answer.clarification_questions,
          })
        }
      }
      else if (hasIntent(responseData)) {
        if (responseData.intent.actions.includes('ASK_MORE_INFO') || responseData.workflow_hint.stage) {
          setStatus({
            sessionId,
            status: 'input',
            clarificationQuestions: [],
            actions: responseData.intent.actions,
          })
        }
        else {
          setStatus({
            sessionId,
            actions: responseData.intent.actions,
          })
        }
      }
      else {
        // 无法识别的响应类型
        setStatus({
          sessionId,
          status: 'input',
          clarificationQuestions: [],
        })
      }
    }
    else {
      // 其他内容类型（text, loading, error 等）
      setStatus({
        sessionId,
        status: 'input',
        clarificationQuestions: [],
      })
    }
  },
  parseContent(response: string) {
    const { setSessionStatus, addMessage } = get()

    // SSE 消息格式: { type: "message" | "governance_created" | "rag_created" | "model_created", data: {...}, timestamp: ... }
    const sseData = JSON.parse(response) as { type: string, data: any, timestamp: number }

    if (sseData.type === 'message' && sseData.data?.message) {
      const message = sseData.data.message
      setSessionStatus(message)
      addMessage(message)
    }
    // 触发自定义事件，让其他组件可以监听
    if (sseData.type === 'governance_created' || sseData.type === 'rag_created' || sseData.type === 'model_created') {
      window.dispatchEvent(new CustomEvent(sseData.type, { detail: sseData.data }))
    }
  },
}))

export default useStore
