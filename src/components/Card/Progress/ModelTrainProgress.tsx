import * as React from 'react'
import ProgressCard from './ProgressCard'

interface ModelTrainProgressProps {
  title: string
  status: 'pending' | 'success'
}

const trainIcon = (
  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
    <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
  </svg>
)

const ModelTrainProgress: React.FC<ModelTrainProgressProps> = ({ title, status }) => {
  const isPending = status === 'pending'

  return (
    <ProgressCard
      title={title}
      statusText={isPending ? '模型训练中...' : '训练完成'}
      progressLabel={isPending ? '正在处理数据' : '模型训练完成'}
      statusLabel={isPending ? '运行中' : '已完成'}
      isPending={isPending}
      themeColor="indigo"
      pendingIcon={trainIcon}
    />
  )
}

export default ModelTrainProgress
