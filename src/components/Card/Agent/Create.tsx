import * as React from 'react'

// 1. 定义传入数据的 TypeScript 类型
export interface ComputeEstimate {
  workload_level: string
  gpu_type: string
  gpu_count: number
  gpu_memory_gb: number
  cpu_cores: number
  ram_gb: number
  estimated_hours: number
  cost_sensitivity: string
  rationale: string
  confidence: number
}

interface ComputeEstimateSummaryProps {
  data: ComputeEstimate
}

export const ComputeEstimateSummary: React.FC<ComputeEstimateSummaryProps> = ({ data }) => {
  // 为了让叙述更符合中文阅读习惯，做一些简单的映射翻译
  const workloadMap: Record<string, string> = { small: '轻量级 (Small)', medium: '中型 (Medium)', large: '大型 (Large)' }
  const costMap: Record<string, string> = { low: '较低', medium: '中等', high: '较高' }

  const workloadName = workloadMap[data.workload_level] || data.workload_level
  const costName = costMap[data.cost_sensitivity] || data.cost_sensitivity
  const confidencePercent = Math.round(data.confidence * 100)

  return (
    // 采用宽松的行高 (leading-loose) 和柔和的文本颜色，适合长段落阅读
    <div className="leading-loose space-y-4 px-5 pb-5 text-[18px]">

      {/* 第一段：描述计算负载、硬件配置与成本 */}
      <p>
        根据系统智能评估（置信度评估为
        {' '}
        <span className="font-semibold text-gray-900">
          {confidencePercent}
          %
        </span>
        ），
        当前任务属于
        <span className="font-semibold text-blue-600 px-1">{workloadName}</span>
        的计算负载。
        在硬件资源分配上，建议采用
        {' '}
        <span className="font-semibold text-gray-900">{data.gpu_type}</span>
        {' '}
        方案，
        {data.gpu_count === 0
          ? '无需额外配备 GPU 算力。'
          : `需配备 ${data.gpu_count} 张 GPU（总显存 ${data.gpu_memory_gb}GB）。`}
        具体而言，底层仅需分配
        {' '}
        <span className="font-semibold text-gray-900">
          {data.cpu_cores}
          {' '}
          核 CPU
        </span>
        {' '}
        与
        <span className="font-semibold text-gray-900">
          {' '}
          {data.ram_gb}
          GB 内存
        </span>
        {' '}
        即可满足正常运转。
        考虑到本次任务的成本敏感度为
        <span className="font-medium text-indigo-600 px-1">{costName}</span>
        ，该资源组合能在保证需求的同时有效控制开销。
      </p>

      {/* 第二段：描述工时与具体评估理由 */}
      <p>
        综合来看，预计该环节的开发与调试耗时约为
        {' '}
        <span className="font-semibold text-green-600 px-1">
          {data.estimated_hours}
          {' '}
          小时
        </span>
        。
        得出此套方案的核心决策依据如下：
      </p>

      {/* 引用块：展示 rationale（理由） */}
      <blockquote className="border-l-4 border-blue-400 bg-blue-50/50 pl-4 py-3 pr-4 italic">
        {data.rationale}
      </blockquote>

    </div>
  )
}
