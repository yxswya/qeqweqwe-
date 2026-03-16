import type { FileResponse, MessageResponse } from '../utils/elysia'
import type { ActionType, ApiResponse, ClarificationQuestion, Message } from '@/components/Session/types'

import { fetchEventSource } from '@microsoft/fetch-event-source'
import { create } from 'zustand'
import { hasAnswer, hasIntent } from '@/components/Session/types'
import { getSessionMessages } from '../utils/elysia'

// 使用 AbortController 来控制主动断开连接
const ctrl = new AbortController()

let fs: any

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
    const { getMessages, clearSession, parseContent } = get()
    if (!sessionId) {
      clearSession()
      return
    }
    set({ sessionId })

    if (!fs) {
      fs = fetchEventSource(`${import.meta.env.VITE_API_BASE_URL}/session/chat/sse/${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: ctrl.signal, // 传入 signal 以便随时中断

        // 连接成功打开时触发
        async onopen() {},

        // 接收到服务端消息时触发
        onmessage(msg) {
          const { data, event } = msg

          if (event === 'message') {
            console.log(event, '///', data)
            // TODO: 新增或替换指定消息内容
            parseContent(data)
          }
        },

        // 连接关闭时触发
        onclose() {
          console.log('🔌 SSE 连接已关闭')
          // 注意：fetch-event-source 默认会在关闭后尝试重连
          // 如果你不想重连，可以在这里抛出异常或调用 ctrl.abort()
        },

        // 发生错误时触发
        onerror(err) {
          console.error('⚠️ SSE 发生异常:', err)
          // throw err; // 如果抛出错误，就不会自动重连
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
