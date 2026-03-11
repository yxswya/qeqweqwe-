import type { Message } from './types'
import * as React from 'react'

import { useEffect, useMemo, useRef } from 'react'
import { useParams } from 'react-router'
import MessageList from '@/components/Session/Message/MessageList.tsx'
import { useStore } from '@/components/Session/store'
import { useSSE } from '@/components/Session/utils/useSSE.ts'
import WorkFlow from '@/components/Session/WorkFlow/index.tsx'

export interface SSENormalMessage {
  type: 'NEW_BOT_MESSAGE' | 'UPDATE_BOT_MESSAGE'
  data: {
    id: string
    content: Message
  }
}

const Conversation: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, initConversation, setStatus } = useStore()
  const { id } = useParams<{ id: string }>()

  const eventUrl = useMemo(() => id ? `http://localhost:3000/api/conversations/${id}/sse` : null, [id])
  // const { data, error, readyState, close } =
  useSSE(eventUrl, {
    withCredentials: true, // 如果需要携带 Cookie
    onMessage: (msg: SSENormalMessage) => {
      console.log('新消息:', msg)
      // 可以在这里触发其他副作用，如播放提示音

      if (msg.type === 'UPDATE_BOT_MESSAGE') {
        const findIndex = messages.findIndex(el => el.id === msg.data.content.id)
        if (findIndex !== -1) {
          messages.splice(findIndex, 1, msg.data.content)
        }

        if (msg.data.content.messageType === 'RAG_BUILD_INDEX') {
          setStatus({
            status: 'none',
            clarificationQuestions: [],
            messages: [...messages, msg.data.content],
          })
        }

        if (msg.data.content.messageType === 'ASK_MORE_INFO_COMPLETENESS') {
          const content = JSON.parse(msg.data.content.content)
          setStatus({
            status: 'questions',
            clarificationQuestions: content.answer.clarification_questions,
            messages: [...messages],
          })
        }
        else if (msg.data.content.messageType === 'ASK_MORE_INFO_INTENT') {
          setStatus({
            status: 'input',
            clarificationQuestions: [],
            messages: [...messages],
          })
        }
        else {
          setStatus({
            status: 'none',
            clarificationQuestions: [],
            messages: [...messages],
          })
        }
      }
    },
    onOpen: () => console.log('连接已打开'),
    onError: err => console.error('SSE 错误', err),
  })

  useEffect(() => {
    initConversation(id as string)
  }, [id, initConversation])

  useEffect(() => {
    const time = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)

    return () => {
      clearTimeout(time)
    }
  }, [messages])

  return (
    <div className="flex h-full">
      <div className="w-0 flex-1 h-full flex flex-col gap-5 overflow-auto py-6">
        <MessageList />
        <div ref={messagesEndRef} className="h-4 w-full shrink-0"></div>
      </div>
      <div className="w-96 h-full bg-white shrink-0">
        <WorkFlow />
      </div>
    </div>
  )
}

export default Conversation
