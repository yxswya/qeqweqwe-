import type { FileResponse, MessageResponse } from '../utils/elysia'
import type { ActionType, ApiResponse, ClarificationQuestion, Message } from '@/components/Session/types'

import { fetchEventSource } from '@microsoft/fetch-event-source'
import { create } from 'zustand'
import { hasAnswer, hasIntent } from '@/components/Session/types'
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
      sessionId: undefined,
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

      const fetchPromise = fetchEventSource(
        `${import.meta.env.VITE_API_BASE_URL}/session/chat/sse/${sessionId}?_t=${cacheBuster}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
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
    const { sessionId, setSessionStatus } = get()
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
    const { sessionId, setStatus } = get()
    setStatus({
      status: 'loading',
    })

    fetch(`${import.meta.env.VITE_API_BASE_URL}/session/chat/${sessionId || ''}`, {
      credentials: 'include',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: 'xx',
        text,
      }),
    }).then(res => res.json()).then((data) => {
      const { sessionId } = data
      set({ sessionId })
    })
  },
  setSessionStatus(data: MessageResponse) {
    const { setStatus } = get()
    const sessionId = data.sessionId
    if (data.type === 'json') {
      const content = JSON.parse(data.content) as ApiResponse
      // const sessionId = hasAnswer(content) ? content.answer.session_id : content.completeness.session_id
      if (hasAnswer(content)) {
        if (content.answer.clarification_questions.length > 0) {
          setStatus({
            sessionId,
            status: 'questions',
            clarificationQuestions: content.answer.clarification_questions,
          })
        }
      }
      else if (hasIntent(content)) {
        // console.log(content.intent.actions.join('/'), '/', content.workflow_hint.stage)
        if (content.intent.actions.includes('ASK_MORE_INFO') || content.workflow_hint.stage) {
          setStatus({
            sessionId,
            status: 'input',
            clarificationQuestions: [],
            actions: content.intent.actions,
          })
        }
        else {
          setStatus({
            sessionId,
            actions: content.intent.actions,
          })
        }
      }
      else {
        // console.log('存有无法识别的消息')
      }
    }
    else {
      setStatus({
        sessionId,
        status: 'none',
        clarificationQuestions: [],
      })
    }
  },
  parseContent(response: string) {
    const { setSessionStatus, addMessage } = get()
    const data = JSON.parse(response) as MessageResponse
    setSessionStatus(data)

    addMessage(data)
  },
}))

export default useStore
