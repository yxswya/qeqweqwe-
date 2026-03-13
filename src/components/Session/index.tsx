import * as React from 'react'

import { useEffect, useRef } from 'react'
import { useParams } from 'react-router'
import MessageList from '@/components/Session/Message/MessageList.tsx'
import { useStore } from '@/components/Session/store'
import WorkFlow from '@/components/Session/WorkFlow/index.tsx'

const Conversation: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages, initConversation } = useStore()
  const { id } = useParams<{ id: string }>()

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
