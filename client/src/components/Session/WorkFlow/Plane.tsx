import { Bell, Settings, Workflow } from 'lucide-react'
import Tabs from '@/components/Tabs'
import { GovUploadFile } from './WorkFlow/GovUploadFile'
import ProgressDisplay from './WorkFlow/ProgressDisplay'

function Plane() {
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
                label: '意图识别',
                status: 'success',
                subSteps: [
                  { id: '1-1', label: '解析用户输入', status: 'success' },
                  { id: '1-2', label: '匹配意图模板', status: 'success' },
                  { id: '1-3', label: '置信度计算', status: 'success' },
                ],
              },
              {
                id: '2',
                label: '提取关键信息',
                status: 'running',
                subSteps: [
                  { id: '2-1', label: '实体识别', status: 'success' },
                  { id: '2-2', label: '关系抽取', status: 'running' },
                  { id: '2-3', label: '属性提取', status: 'pending' },
                ],
              },
              {
                id: '3',
                label: '构建知识库',
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
      label: '通知',
      content: <div>通知内容</div>,
      icon: <Bell size={16} />,
    },
  ]

  return <Tabs tabs={tabs} className="border-t border-gray-200" />
}

export default Plane
