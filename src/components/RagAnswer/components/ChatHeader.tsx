import { Bot, Info, Phone, Video } from 'lucide-react'
import * as React from 'react'

interface ChatHeaderProps {
  title: string
  subtitle?: string
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ title, subtitle }) => {
  return (
    <div
      className="h-[72px] px-6 flex items-center justify-between
        bg-white/85 backdrop-blur-xl border-b border-[#f0f0f0] z-10"
    >
      <div className="flex items-center gap-3.5">
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
              <span className="w-1.5 h-1.5 bg-[#34d399] rounded-full animate-pulse" />
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
  )
}

export default ChatHeader
