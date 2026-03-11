import * as React from 'react'
import { useEffect, useRef } from 'react'
import { List } from '@/components/WorkFlow'
import { useStore } from '@/components/WorkFlow/store'
import WorkFlow from '../WorkFlow'

const ChatComponent: React.FC = () => {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { messages } = useStore()

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
      <div className="w-0 flex-1">
        <div className="h-full flex-1 flex flex-col gap-5 overflow-auto py-6">
          <List />
          <div ref={messagesEndRef} className="h-4 w-full shrink-0"></div>
        </div>
      </div>
      <div className="w-96 h-full bg-white shrink-0">
        <WorkFlow />
      </div>
    </div>
  )
}

export default ChatComponent
