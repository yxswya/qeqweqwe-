import type { IntentCardMessage } from '@/api/modules'
import type { Message, MessageType } from '@/components/Chat/types.ts'
import { create } from 'zustand'
import { fetchSessionMessagesAndConvert, sendChatMessageAndConvert } from '@/components/Chat/services/chatService.ts'
import { MessageTypes } from '@/components/Chat/types.ts'
import { generateUniqueId } from '@/components/Chat/utils/helpers.ts'

export const useChatStore = create<{
  sessionId: string | undefined
  messages: Message[]

  initSession: () => void
  getMessages: (sessionId: string) => Promise<void>
  addMessage: (message: Message) => void

  addUserMessage: (content: string) => void
  addAssistantMessage: (content: string, type?: MessageType) => void
  addAssistantMessageRequest: (content: string) => string // 带有 loading
  updateAssistantMessage: (id: string, message: Message) => void

  printAssistantMessage: (message: Message) => void // 查看消息里面有没有需要额外输出的内容

  sendMessage: (text: string) => Promise<string>
}>((set, get) => ({
  sessionId: '',
  messages: [],

  initSession() {
    set({
      messages: [],
      sessionId: undefined,
    })
  },

  async getMessages(sessionId) {
    set({ sessionId })
    const messages = await fetchSessionMessagesAndConvert(sessionId)
    console.log(messages)
    set({ messages })
  },

  addMessage(message: Message) {
    set(state => ({ messages: [...state.messages, message] }))
  },

  addUserMessage(content) {
    const messageId = generateUniqueId()
    const message: Message = {
      id: messageId,
      type: MessageTypes.UserText,
      raw: {
        id: messageId,
        session_id: generateUniqueId(),
        role: 'user',
        meta_data: null,
        result_data: null,
        is_safe: true,
        content,
        created_at: new Date().toISOString(),
      },
    }
    set(state => ({ messages: [...state.messages, message] }))
  },

  addAssistantMessage(content, type) {
    const messageId = generateUniqueId()
    const message: Message = {
      id: messageId,
      type: type || MessageTypes.AssistantText,
      raw: {
        id: messageId,
        session_id: generateUniqueId(),
        role: 'assistant',
        meta_data: null,
        result_data: null,
        is_safe: true,
        content,
        created_at: new Date().toISOString(),
      },
    }
    set(state => ({ messages: [...state.messages, message] }))
    return message.id
  },

  addAssistantMessageRequest(content) {
    const messageId = generateUniqueId()
    const message: Message = {
      id: messageId,
      type: MessageTypes.AssistantText,
      loading: true,
      raw: {
        id: messageId,
        session_id: generateUniqueId(),
        role: 'assistant',
        meta_data: null,
        result_data: null,
        is_safe: true,
        content,
        created_at: new Date().toISOString(),
      },
    }
    set(state => ({ messages: [...state.messages, message] }))
    return message.id
  },

  updateAssistantMessage(id, newMessage) {
    const { messages, printAssistantMessage } = get()
    set({
      messages: messages.map(msg =>
        msg.id === id ? { ...msg, ...newMessage } : msg,
      ),
    })

    printAssistantMessage(newMessage)
  },

  printAssistantMessage(message) {
    const { addAssistantMessage } = get()
    // if (message.genre !== 'Robot: Txt') {
    //   return
    // }

    const raw = message.raw
    if (raw.meta_data?.stage === 'intent') {
      console.log(raw)
      addAssistantMessage(raw.meta_data.intent.compute_estimate.rationale)
      addAssistantMessage(raw.meta_data.intent.rationale)
      addAssistantMessage(raw.meta_data.workflow_hint.reason)

      if (raw.meta_data.intent.actions[0] === 'RAG_BUILD_INDEX') {
        addAssistantMessage(raw.meta_data.intent.actions[0], MessageTypes.AssistantRagBuildIndex)
      }
    }
  },

  async sendMessage(text) {
    const {
      addUserMessage,
      addAssistantMessageRequest,
      sessionId,
      updateAssistantMessage,
    } = get()
    addUserMessage(text)
    const messageId = addAssistantMessageRequest('正在思考中...')

    try {
      const message = await sendChatMessageAndConvert(text, sessionId)
      message.loading = false
      updateAssistantMessage(messageId, message)

      if (message.raw.session_id) {
        set({
          sessionId: message.raw.session_id,
        })
      }

      console.log('message', message)
      // const sessionId = message.raw.session_id
      return message.raw.session_id
    }
    catch (error) {
      console.error(error)
      return ''
    }
  },
}))
