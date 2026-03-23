import type { ApiResponse } from '../types'
import type { StepItem } from './WorkFlow/ProgressDisplay'
import { Bell, Settings, Workflow } from 'lucide-react'
import { useStore } from '@/components/Session/store'
import Tabs from '@/components/Tabs'
import { hasAnswer, hasIntent } from '../types'
import { GovUploadFile } from './WorkFlow/GovUploadFile'
import Products from './WorkFlow/Products'
import ProgressDisplay from './WorkFlow/ProgressDisplay'

function Plane() {
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
        // console.log('存有无法识别的内容')
      }
    }
    else {
      return { label: '意图识别中...', id: msg.id, status: 'failed' }
    }
  })
  // console.log(datas)

  const tabs = [
    {
      id: 'profile',
      label: '工作流',
      content: (
        <div className="px-4">
          <ProgressDisplay
            currentStepIndex={1}
            steps={[
              {
                id: '1',
                label: '核心需求分析',
                status: 'success',
                subSteps: datas,
              },
              {
                id: '2',
                label: '资源智能补齐',
                status: 'running',
                subSteps: [
                  { id: '2-1', label: '实体识别', status: 'success' },
                  { id: '2-2', label: '关系抽取', status: 'running' },
                  { id: '2-3', label: '属性提取', status: 'pending' },
                ],
              },
              {
                id: '3',
                label: '工作流搭建与执行',
                status: 'pending',
                subSteps: [
                  { id: '3-1', label: '向量化处理', status: 'pending' },
                  { id: '3-2', label: '索引构建', status: 'pending' },
                  { id: '3-3', label: '存储更新', status: 'pending' },
                ],
              },
            ]}
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
          <span>rag 构建产物</span>
          <Products />
        </div>
      ),
      icon: <Bell size={16} />,
    },
  ]

  return <Tabs tabs={tabs} className="border-t border-gray-200" />
}

export default Plane
