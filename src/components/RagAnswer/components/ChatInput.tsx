import { ArrowUp, Image, Mic, Paperclip } from 'lucide-react'
import * as React from 'react'

interface ChatInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  placeholder?: string
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  placeholder = '输入消息...',
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  // 自动调整高度
  const autoResize = () => {
    const textarea = textareaRef.current
    if (textarea) {
      textarea.style.height = 'auto'
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value)
    autoResize()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  const hasContent = value.trim().length > 0

  return (
    <div
      className="px-6 py-4 pb-5 bg-white/85 backdrop-blur-xl border-t border-[#f0f0f0]"
    >
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
            <Paperclip size={16} />
          </button>
          <button
            type="button"
            className="w-[34px] h-[34px] rounded-lg border-none bg-transparent cursor-pointer
              flex items-center justify-center text-[#9ca3af] transition-colors duration-150
              hover:text-[#1a1a1a]"
            title="图片"
          >
            <Image size={16} />
          </button>
        </div>

        {/* Input */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
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
            <Mic size={16} />
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
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  )
}

export default ChatInput
