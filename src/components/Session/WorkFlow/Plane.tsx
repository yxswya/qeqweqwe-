import type { ApiResponse } from '../types'
import type { StepItem } from './WorkFlow/ProgressDisplay'
import { Bell, GitBranch, Settings, Workflow } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useStore } from '@/components/Session/store'
import Tabs from '@/components/Tabs'
import { hasAnswer, hasIntent } from '../types'
import { GovUploadFile } from './WorkFlow/GovUploadFile'
import Products from './WorkFlow/Products'
import ProgressDisplay from './WorkFlow/ProgressDisplay'

function Plane() {
  const navigate = useNavigate()
  const sessionId = useStore(state => state.sessionId)
  const messages = useStore(state => state.messages)
  const datas: StepItem[] = messages.filter(msg => msg.senderId === 'system-bot-id').map((msg) => {
    if (msg.type === 'json') {
      const content = JSON.parse(msg.content) as ApiResponse
      if (hasAnswer(content)) {
        return { label: content.answer.normalized_request.ai_summary, id: msg.id, status: 'success' }
      }
      else if (hasIntent(content)) {
        return { label: content.workflow_hint.reason, id: msg.id, status: 'success' }
      }
      else {
        return { label: '??', id: msg.id, status: 'failed' }
        // console.log('存有无法识别的内容')
      }
    }
    else {
      return { label: '意图识别中...', id: msg.id, status: 'failed' }
    }
  })

  const handleViewCanvas = () => {
    if (sessionId) {
      navigate(`/canvas/${sessionId}`)
    }
  }

  const tabs = [
    {
      id: 'profile',
      label: '工作流',
      content: (
        <div className="px-4 overflow-auto h-full">
          <ProgressDisplay
            currentStepIndex={datas.length - 1}
            steps={datas}
          />
        </div>
      ),
      icon: <Workflow size={16} />,
    },
    {
      id: 'settings',
      label: '治理文件',
      content: (
        <div className="px-4">
          <GovUploadFile />
        </div>
      ),
      icon: <Settings size={16} />,
    },
    {
      id: 'notifications',
      label: '产出',
      content: (
        <div>
          <Products />
        </div>
      ),
      icon: <Bell size={16} />,
    },
  ]

  return (
    <div className="border-t border-gray-200 h-full flex flex-col">
      {/* 查看图谱按钮 */}
      <div className="px-4 py-3 border-b border-gray-100">
        <button
          type="button"
          onClick={handleViewCanvas}
          disabled={!sessionId}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          <GitBranch size={16} />
          <span>查看会话图谱</span>
        </button>
      </div>
      <Tabs tabs={tabs} className="flex-1 flex flex-col" />
    </div>
  )
}

export default Plane
