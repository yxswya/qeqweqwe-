import { Loader2 } from 'lucide-react'
import * as React from 'react'

interface LoadingOverlayProps {
  visible: boolean
  text?: string
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  text = '正在登录...',
}) => {
  if (!visible)
    return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm
        animate-[fadeIn_0.3s_ease-out]"
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes pulse-ring {
            0% { transform: scale(0.8); opacity: 0.8; }
            50% { transform: scale(1.2); opacity: 0.3; }
            100% { transform: scale(0.8); opacity: 0.8; }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
        `}
      </style>

      {/* 背景装饰圆 */}
      <div className="absolute w-64 h-64 rounded-full bg-black/5 animate-[pulse-ring_2s_ease-in-out_infinite]" />
      <div className="absolute w-48 h-48 rounded-full bg-black/5 animate-[pulse-ring_2s_ease-in-out_infinite_0.3s]" />

      {/* 主图标 */}
      <div className="relative z-10 animate-[float_2s_ease-in-out_infinite]">
        <div className="w-20 h-20 rounded-2xl bg-black flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        </div>
      </div>

      {/* 文字 */}
      <p className="mt-8 text-base font-medium text-gray-700 tracking-wide">
        {text}
      </p>

      {/* 进度点 */}
      <div className="flex gap-2 mt-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-black animate-[pulse_1s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default LoadingOverlay
