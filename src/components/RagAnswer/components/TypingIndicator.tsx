import { Bot } from 'lucide-react'
import * as React from 'react'

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start gap-2 animate-[messageSlideIn_0.4s_ease-out]">
      <div
        className="w-7 h-7 min-w-7 rounded-full flex items-center justify-center
          text-[10px] font-semibold bg-[#e8e0f0] text-[#6b4c8a] opacity-100"
      >
        <Bot size={12} />
      </div>
      <div
        className="bg-white rounded-[20px] px-5 py-3.5 flex items-center gap-1
          shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
      >
        <style>
          {`
            @keyframes typingBounce {
              0%, 60%, 100% {
                transform: translateY(0);
                opacity: 0.4;
              }
              30% {
                transform: translateY(-6px);
                opacity: 1;
              }
            }
          `}
        </style>
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-1.5 h-1.5 bg-[#9ca3af] rounded-full"
            style={{
              animation: 'typingBounce 1.4s ease-in-out infinite',
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default TypingIndicator
