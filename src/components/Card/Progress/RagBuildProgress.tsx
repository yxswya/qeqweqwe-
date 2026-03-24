import * as React from 'react'
import ProgressCard from './ProgressCard'

interface RagBuildProgressProps {
  title: string
  status: 'pending' | 'success'
}

const ragIcon = (
  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
  </svg>
)

const RagBuildProgress: React.FC<RagBuildProgressProps> = ({ title, status }) => {
  const isPending = status === 'pending'

  return (
    <ProgressCard
      title={title}
      statusText={isPending ? '知识库构建中...' : '知识库构建完成'}
      progressLabel={isPending ? '正在构建向量索引' : '向量索引构建完成'}
      statusLabel={isPending ? '运行中' : '已完成'}
      isPending={isPending}
      themeColor="blue"
      pendingIcon={ragIcon}
    />
  )
}

export default RagBuildProgress
