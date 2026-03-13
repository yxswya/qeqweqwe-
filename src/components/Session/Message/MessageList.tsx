import * as React from 'react'
import MessageListItem from '@/components/Session/Message/MessageListItem.tsx'
import useStore from '@/components/Session/store'

const MessageList: React.FC = () => {
  const messages = useStore(state => state.messages)
  return (
    <div className="space-y-3 p-4">
      {messages.map(msg => <MessageListItem message={msg} key={msg.id} />)}
    </div>
  )
}

export default MessageList
