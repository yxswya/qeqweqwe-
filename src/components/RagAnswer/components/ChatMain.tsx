import type { Message } from './MessageItem'
import { ArrowLeft, Bot, Check, CheckCheck, Info, Phone, Video } from 'lucide-react'
import * as React from 'react'
import MessageItem from './MessageItem'
import TypingIndicator from './TypingIndicator'

interface ChatMainProps {
  title: string
  subtitle?: string
  online?: boolean
  messages: Message[]
  isTyping: boolean
  inputValue: string
  onInputChange: (value: string) => void
  onSend: () => void
  onBack?: () => void
  showBack?: boolean
}

const ChatMain: React.FC<ChatMainProps> = ({
  title,
  subtitle,
  online = false,
  messages,
  isTyping,
  inputValue,
  onInputChange,
  onSend,
  onBack,
  showBack = false,
}) => {
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // 自动滚动到底部
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // 自动调整高度
  const autoResize = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value)
    autoResize()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  // 判断是否需要显示头像
  const shouldShowAvatar = (index: number) => {
    if (index === 0)
      return true
    const currentMsg = messages[index]
    const prevMsg = messages[index - 1]
    return currentMsg.isUser !== prevMsg.isUser
  }

  const hasContent = inputValue.trim().length > 0

  return (
    <main className="flex-1 flex flex-col bg-[#f8f9fa] relative min-w-0">
      {/* 动画样式 */}
      <style>
        {`
          @keyframes messageSlideIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes sendBtnPop {
            0% { transform: scale(0.8); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>

      {/* Chat Header */}
      <div
        className="h-[72px] px-6 flex items-center justify-between
          bg-white/85 backdrop-blur-xl border-b border-[#f0f0f0] z-10"
      >
        <div className="flex items-center gap-3.5">
          {showBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-[38px] h-[38px] rounded-lg border-none bg-transparent cursor-pointer
                flex items-center justify-center text-[#6b7280] transition-all duration-150
                hover:text-[#1a1a1a] active:scale-[0.92] md:hidden"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center
              text-sm font-semibold bg-[#e8e0f0] text-[#6b4c8a]"
          >
            <Bot size={18} />
          </div>
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-[#1a1a1a]">
              {title}
            </h2>
            {subtitle && (
              <div className="text-xs text-[#9ca3af] flex items-center gap-1.5">
                {online && (
                  <span className="w-1.5 h-1.5 bg-[#34d399] rounded-full animate-pulse" />
                )}
                <span>{subtitle}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-0.5">
          <button
            type="button"
            className="w-[38px] h-[38px] rounded-lg border-none bg-transparent cursor-pointer
              flex items-center justify-center text-[#6b7280] transition-all duration-150
              relative overflow-hidden hover:text-[#1a1a1a]
              before:content-[''] before:absolute before:inset-0 before:bg-[#1a1a1a]
              before:opacity-0 before:rounded-inherit hover:before:opacity-5
              active:scale-[0.92]"
            title="语音通话"
          >
            <Phone size={17} />
          </button>
          <button
            type="button"
            className="w-[38px] h-[38px] rounded-lg border-none bg-transparent cursor-pointer
              flex items-center justify-center text-[#6b7280] transition-all duration-150
              relative overflow-hidden hover:text-[#1a1a1a]
              before:content-[''] before:absolute before:inset-0 before:bg-[#1a1a1a]
              before:opacity-0 before:rounded-inherit hover:before:opacity-5
              active:scale-[0.92]"
            title="视频通话"
          >
            <Video size={17} />
          </button>
          <button
            type="button"
            className="w-[38px] h-[38px] rounded-lg border-none bg-transparent cursor-pointer
              flex items-center justify-center text-[#6b7280] transition-all duration-150
              relative overflow-hidden hover:text-[#1a1a1a]
              before:content-[''] before:absolute before:inset-0 before:bg-[#1a1a1a]
              before:opacity-0 before:rounded-inherit hover:before:opacity-5
              active:scale-[0.92]"
            title="详情"
          >
            <Info size={17} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-1
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-black/10 [&::-webkit-scrollbar-thumb]:rounded"
      >
        {/* Date Divider */}
        <div className="flex items-center gap-4 my-5">
          <div className="flex-1 h-px bg-[#e8e8e8]" />
          <span className="text-[11px] font-medium text-[#9ca3af] tracking-[0.5px] whitespace-nowrap">
            今天
          </span>
          <div className="flex-1 h-px bg-[#e8e8e8]" />
        </div>

        {/* Messages */}
        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex flex-col gap-0.5 mb-2 ${
              message.isUser ? 'items-end' : 'items-start'
            }`}
          >
            <MessageItem message={message} showAvatar={shouldShowAvatar(index)} />
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex flex-col items-start">
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 pb-5 bg-white/85 backdrop-blur-xl border-t border-[#f0f0f0]">
        <div
          className="flex items-end gap-2.5 bg-white border-[1.5px] border-[#e8e8e8]
            rounded-2xl pl-[18px] pr-1.5 py-1.5 transition-all duration-250
            shadow-[0_1px_2px_rgba(0,0,0,0.04)]
            focus-within:border-[#1a1a1a] focus-within:shadow-[0_0_0_3px_rgba(26,26,26,0.06)]"
        >
          {/* Left actions */}
          <div className="flex items-center pb-1">
            <button
              type="button"
              className="w-[34px] h-[34px] rounded-lg border-none bg-transparent cursor-pointer
                flex items-center justify-center text-[#9ca3af] transition-colors duration-150
                hover:text-[#1a1a1a]"
              title="添加附件"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>
            <button
              type="button"
              className="w-[34px] h-[34px] rounded-lg border-none bg-transparent cursor-pointer
                flex items-center justify-center text-[#9ca3af] transition-colors duration-150
                hover:text-[#1a1a1a]"
              title="图片"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </button>
          </div>

          {/* Input */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="输入消息..."
            rows={1}
            className="flex-1 border-none outline-none text-sm font-inherit text-[#1a1a1a]
              resize-none max-h-[120px] min-h-9 leading-relaxed py-1.5 bg-transparent
              placeholder:text-[#9ca3af]"
          />

          {/* Voice button (hidden when has content) */}
          {!hasContent && (
            <button
              type="button"
              className="w-[34px] h-[34px] rounded-lg border-none bg-transparent cursor-pointer
                flex items-center justify-center text-[#9ca3af] transition-colors duration-150 mb-1
                hover:text-[#1a1a1a]"
              title="语音"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>
          )}

          {/* Send button */}
          <button
            type="button"
            onClick={onSend}
            disabled={!hasContent}
            className={`w-10 h-10 min-w-10 border-none rounded-xl cursor-pointer
              flex items-center justify-center transition-all duration-150
              ${hasContent
              ? 'bg-[#1a1a1a] text-white hover:bg-[#333] hover:scale-105 active:scale-[0.92]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 7-7 7 7" />
              <path d="M12 19V5" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  )
}

export default ChatMain
