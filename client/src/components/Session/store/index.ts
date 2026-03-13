import type { FileResponse, MessageResponse } from '../utils/elysia'
import type { Message } from '@/components/Session/types.ts'
import type { ActionType, ApiResponse, ApiResponseIntent, ClarificationQuestion } from '@/components/WorkFlow/types'
import { fetchEventSource } from '@microsoft/fetch-event-source'
import { create } from 'zustand'
import { hasAnswer } from '@/components/WorkFlow/types'
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
  fetchRagBuild: () => Promise<void>
  setStatus: (obj: Partial<{
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
  },

  async getMessages() {
    const { sessionId, setSessionStatus } = get()
    const response = await getSessionMessages(sessionId)
    console.log(response)

    if (!response)
      return

    const { messages, files } = response
    set({
      messages: [...messages],
      files: [...files],
    })
    setSessionStatus(messages[messages.length - 1])
  },

  async fetchRagBuild() {

  },

  async fetchMessage(text) {
    const { setStatusText, sessionId, setStatus, parseContent } = get()
    setStatus({
      status: 'loading',
    })

    await fetchEventSource(`http://localhost:3002/api/v1/session/chat/${sessionId || ''}`, {
      // 关键配置：设置为 true 以携带 Cookie
      credentials: 'include',
      // 如果是跨域请求，建议明确指定 mode 为 'cors'
      mode: 'cors',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: 'xx',
        text,
      }),

      // 当接收到后端 yield sse() 推送的消息时
      onmessage(ev) {
        // ev.event 对应你后端的 event 字段
        // ev.data  对应你后端的 data 字段（字符串形式）
        console.log(ev)

        if (ev.event === 'status' || ev.event === 'heartbeat') {
          // 解析去掉双引号
          setStatusText(ev.data)
        }
        else if (ev.event === 'result') {
          setStatusText('思考完毕！')
          // setResult(ev.data)
          parseContent(ev.data)
        }
        else if (ev.event === 'error') {
          setStatusText(`发生错误: ${ev.data}`)
        }
      },

      onclose() {
        console.log('连接已正常关闭')
      },

      onerror(err) {
        setStatus({
          status: 'none',
          clarificationQuestions: [],
        })
        console.error('流异常断开', err)
        setStatusText('连接断开重试中...')
        throw err // 抛出错误会自动触发重连
      },
    })
  },
  setSessionStatus(data: MessageResponse) {
    const { setStatus } = get()
    if (data.type === 'json') {
      const content = JSON.parse(data.content) as ApiResponse
      const sessionId = hasAnswer(content) ? content.answer.session_id : content.completeness.session_id
      console.log('sessionId', sessionId)
      if (hasAnswer(content)) {
        console.log(content.answer.clarification_questions)
        if (content.answer.clarification_questions.length > 0) {
          setStatus({
            sessionId,
            status: 'questions',
            clarificationQuestions: content.answer.clarification_questions,
          })
        }
      }
      else {
        console.log(content.intent.actions)
        if (content.intent.actions.includes('ASK_MORE_INFO')) {
          setStatus({
            sessionId,
            status: 'input',
            clarificationQuestions: [],
            actions: content.intent.actions,
          })
        }
        else {
          setStatus({
            actions: content.intent.actions,
          })
        }
      }
    }
    else {
      setStatus({
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
