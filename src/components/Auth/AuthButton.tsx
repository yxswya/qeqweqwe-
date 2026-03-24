import type { LucideIcon } from 'lucide-react'
import * as React from 'react'

interface AuthButtonProps {
  icon: LucideIcon
  text: string
  loading?: boolean
  loadingText?: string
}

const AuthButton: React.FC<AuthButtonProps> = ({
  icon: Icon,
  text,
  loading = false,
  loadingText,
}) => {
  return (
    <button
      type="submit"
      disabled={loading}
      className="relative flex items-center justify-center gap-2 w-full py-3.5 px-6
        text-[0.88rem] font-medium text-white bg-black border-none rounded-xl cursor-pointer
        overflow-hidden transition-all duration-400
        disabled:opacity-60 disabled:cursor-not-allowed
        hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]
        active:translate-y-0
        before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:w-0 before:h-0
        before:bg-white/15 before:rounded-full before:-translate-x-1/2 before:-translate-y-1/2
        before:transition-all before:duration-600
        hover:before:w-[400px] hover:before:h-[400px]"
    >
      <span className="relative z-10 flex items-center gap-2">
        <Icon size={18} />
        {loading ? (loadingText || '处理中...') : text}
      </span>
    </button>
  )
}

export default AuthButton
