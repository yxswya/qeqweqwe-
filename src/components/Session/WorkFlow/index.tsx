import * as React from 'react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import Input from '@/components/Session/WorkFlow/Input'
import Questions from '@/components/Session/WorkFlow/Questions'
import useStore from '../store'
import Plane from './Plane'
import Actions from './WorkFlow/Actions'

const WorkFlow: React.FC = () => {
  const navigate = useNavigate()
  const { sessionId, status } = useStore()

  const prevIdRef = useRef(sessionId) // 用 ref 保存上一次的 id
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prevId = prevIdRef.current // 旧的 id

    // 只有当 sessionId 从无到有变化时才导航
    // 避免空值导致的无限循环
    if (prevId !== sessionId && sessionId) {
      navigate(`/app/dashboard/${sessionId}`)
    }

    prevIdRef.current = sessionId
  }, [sessionId, navigate]) // 依赖 id，只有 id 变化时才触发

  useEffect(() => {
    if (contentRef.current) {
      // 移除动画类
      contentRef.current.classList.remove('slide-in-from-bottom')
      // 强制重绘
      void contentRef.current.offsetWidth
      // 添加动画类
      contentRef.current.classList.add('slide-in-from-bottom')
    }
  }, [status])

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-1 h-0">
        <Plane />
      </div>

      <div className="h-96 shrink-0">
        {/* 弹出内容区 */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-6 px-4">
          <style>
            {`
          @keyframes slideInFromBottom {
            from {
              opacity: 0;
              transform: translateY(100%);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .slide-in-from-bottom {
            animation: slideInFromBottom 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          }
        `}
          </style>
          <div ref={contentRef} className="slide-in-from-bottom w-full max-w-2xl">
            {status === 'input' && <Input />}
            {status === 'questions' && <Questions />}
            <Actions />
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkFlow
