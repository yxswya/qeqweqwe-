import { Check, ChevronDown } from 'lucide-react'

import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

interface Session {
  id: string
  title: string
}

function SwitchSession() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { id: currentSessionId } = useParams<{ id?: string }>()
  const navigate = useNavigate()

  // 获取会话列表
  useEffect(() => {
    fetch('http://localhost:3002/api/v1/session/chat', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then((data) => {
        setSessions(data)
      })
  }, [])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // 获取当前会话标题
  const currentSession = sessions.find(s => s.id === currentSessionId)
  const displayTitle = currentSession?.title || '选择会话'

  // 切换会话
  const handleSelectSession = (sessionId: string) => {
    navigate(`/app/dashboard/${sessionId}`)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all duration-200 min-w-[200px]"
      >
        <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
          {displayTitle}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-lg border border-gray-200 shadow-lg overflow-hidden z-50">
          <style>
            {`
            @keyframes dropdownSlideIn {
              from { opacity: 0; transform: translateY(-8px) scale(0.98); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            .dropdown-animate { animation: dropdownSlideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          `}
          </style>

          <div className="dropdown-animate max-h-[300px] overflow-y-auto">
            {sessions.length === 0
              ? (
                  <div className="px-4 py-3 text-sm text-gray-400 text-center">
                    暂无会话
                  </div>
                )
              : (
                  sessions.map(session => (
                    <button
                      key={session.id}
                      onClick={() => handleSelectSession(session.id)}
                      className={`w-full px-4 py-3 text-left flex items-center justify-between gap-3 transition-colors duration-150 ${session.id === currentSessionId ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className="text-sm font-medium truncate flex-1">
                        {session.title}
                      </span>
                      {session.id === currentSessionId && (
                        <Check size={16} className="flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
          </div>
        </div>
      )}
    </div>
  )
}

export default SwitchSession
