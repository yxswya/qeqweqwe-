import type { LucideIcon } from 'lucide-react'
import * as React from 'react'

interface AuthHeaderProps {
  icon: LucideIcon
  title: string
  subtitle: string
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="text-center mb-10">
      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 mb-6
          transition-all duration-400 hover:scale-105 hover:-rotate-[3deg] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
      >
        <Icon size={24} />
      </div>
      <h1 className="text-[1.65rem] font-semibold tracking-[-0.03em] mb-2">
        {title}
      </h1>
      <p className="text-[0.88rem] text-gray-500 leading-relaxed">
        {subtitle}
      </p>
    </div>
  )
}

export default AuthHeader
