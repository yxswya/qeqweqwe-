import { Bot, Check, CheckCheck, User } from 'lucide-react'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'

export interface Message {
  id: number
  content: string
  isUser: boolean
  timestamp: string
  status?: 'sending' | 'sent' | 'read'
}

interface MessageItemProps {
  message: Message
  showAvatar?: boolean
}

const MessageItem: React.FC<MessageItemProps> = ({ message, showAvatar = false }) => {
  const isUser = message.isUser

  return (
    <div
      className={`flex items-end gap-2 max-w-[72%] animate-[messageSlideIn_0.4s_ease-out]
        ${isUser ? 'flex-row-reverse' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-7 h-7 min-w-7 rounded-full flex items-center justify-center
          text-[10px] font-semibold mb-0.5 transition-opacity duration-150
          ${showAvatar ? 'opacity-100' : 'opacity-0'}
          ${isUser
      ? 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white'
      : 'bg-[#e8e0f0] text-[#6b4c8a]'
    }`}
      >
        {isUser ? <User size={12} /> : <Bot size={12} />}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <div
          className={`px-4 py-2.5 text-[13.5px] leading-relaxed max-w-full break-words
            ${isUser
      ? 'bg-[#1a1a1a] text-white rounded-[20px_4px_4px_20px]'
      : 'bg-white text-[#1a1a1a] rounded-[4px_20px_20px_4px] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
    }
          ${showAvatar && !isUser ? 'rounded-tl-[20px]' : ''}
          ${showAvatar && isUser ? 'rounded-tr-[20px]' : ''}`}
        >
          {isUser
            ? (
                <span className="whitespace-pre-wrap">{message.content}</span>
              )
            : (
                <div className="prose prose-sm prose-slate max-w-none
                    prose-headings:text-[#1a1a1a] prose-headings:font-semibold
                    prose-p:my-1 prose-p:leading-relaxed
                    prose-code:bg-slate-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[#1a1a1a] prose-code:before:content-none prose-code:after:content-none
                    prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-lg prose-pre:my-2 prose-pre:p-3
                    prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5
                    prose-a:text-indigo-600 prose-a:no-underline hover:prose-a:underline
                    prose-strong:text-[#1a1a1a]
                    prose-blockquote:border-l-indigo-400 prose-blockquote:bg-slate-50 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r prose-blockquote:not-italic"
                >
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
        </div>
        <div
          className={`flex items-center gap-1 px-1 text-[10.5px] text-[#9ca3af]
            ${isUser ? 'justify-end' : ''}`}
        >
          <span>{message.timestamp}</span>
          {isUser && message.status && (
            <span className={message.status === 'read' ? 'text-[#1a1a1a]' : ''}>
              {message.status === 'read' ? <CheckCheck size={14} /> : <Check size={14} />}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default MessageItem
