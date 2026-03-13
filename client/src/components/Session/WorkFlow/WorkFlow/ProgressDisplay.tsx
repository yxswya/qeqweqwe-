import type * as React from 'react'

import { Check, ChevronDown, ChevronRight, Circle, Loader2, XCircle } from 'lucide-react'

import { useState } from 'react'

export type WorkflowStep = 'pending' | 'running' | 'success' | 'failed'

export interface SubStepItem {
  id: string
  label: string
  status: WorkflowStep
  error?: string
}

export interface StepItem {
  id: string
  label: string
  status: WorkflowStep
  error?: string
  subSteps?: SubStepItem[]
}

interface ProgressDisplayProps {
  steps: StepItem[]
  currentStepIndex: number
}

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ steps, currentStepIndex }) => {
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(() => new Set())

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      }
      else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  // 计算进度条高度百分比
  const getProgressHeight = () => {
    if (steps.length === 0)
      return 0
    return ((currentStepIndex + 1) / steps.length) * 100
  }

  return (
    <div className="w-full py-2">
      <style>
        {`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes progressGrow {
          from { height: 0%; }
        }
        .progress-grow {
          animation: progressGrow 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes expandCollapse {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        .expand-collapse {
          animation: expandCollapse 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        `}
      </style>

      <div className="relative px-4">
        {/* 进度背景线 */}
        <div className="absolute left-7 top-4 bottom-4 w-0.5 bg-gray-200 rounded-full" />

        {/* 进度填充线 - 渐变 */}
        <div
          className="absolute left-7 top-4 w-0.5 bg-gradient-to-b from-emerald-400 via-blue-400 to-blue-400 rounded-full progress-grow origin-top transition-all duration-500 ease-out"
          style={{ height: `${getProgressHeight()}%` }}
        />

        <div className="space-y-4">
          {steps.map((step, index) => {
            const isCurrent = index === currentStepIndex
            const isPast = index < currentStepIndex
            const hasSubSteps = step.subSteps && step.subSteps.length > 0
            const isExpanded = expandedSteps.has(step.id)

            return (
              <div key={step.id} className="relative">
                {/* 步骤行 */}
                <div className="flex items-center gap-3 py-2">
                  {/* 时间轴节点 */}
                  <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                    {isCurrent && step.status !== 'failed'
                      ? (
                          // 当前进行中 - 蓝色背景 + 白色旋转图标
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                            <Loader2 size={14} className="text-white spin" />
                          </div>
                        )
                      : isPast || step.status === 'success'
                        ? (
                            // 已完成 - 绿色背景 + 白色勾选图标
                            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          )
                        : step.status === 'failed'
                          ? (
                              // 失败 - 红色背景 + 白色错误图标
                              <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
                                <XCircle size={14} className="text-white" />
                              </div>
                            )
                          : (
                              // 待处理 - 白色背景 + 灰色圆圈图标
                              <div className="w-6 h-6 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                                <Circle size={10} className="text-gray-300" />
                              </div>
                            )}
                  </div>

                  {/* 步骤内容 */}
                  <div className="flex-1 flex items-center justify-between min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      <p className={`text-sm truncate ${isCurrent ? 'font-semibold text-gray-900' : isPast ? 'text-gray-700' : 'text-gray-400'}`}>
                        {step.label}
                      </p>
                      {hasSubSteps && (
                        <button
                          onClick={() => toggleStep(step.id)}
                          className="shrink-0 p-0.5 hover:bg-gray-100 rounded transition-all duration-200 group"
                        >
                          {isExpanded
                            ? (
                                <ChevronDown size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                              )
                            : (
                                <ChevronRight size={14} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                              )}
                        </button>
                      )}
                    </div>

                    {/* 状态标签 */}
                    <span
                      className={`
                        shrink-0 text-xs
                        ${isCurrent
                ? 'text-blue-600 font-medium'
                : isPast || step.status === 'success'
                  ? 'text-emerald-600'
                  : step.status === 'failed'
                    ? 'text-red-600'
                    : 'text-gray-400'}
                      `}
                    >
                      {isCurrent
                        ? '进行中'
                        : isPast || step.status === 'success'
                          ? '已完成'
                          : step.status === 'failed'
                            ? '失败'
                            : '等待中'}
                    </span>
                  </div>
                </div>

                {/* 子步骤 */}
                {hasSubSteps && isExpanded && (
                  <div className="expand-collapse ml-9 mt-1 space-y-1">
                    {step.subSteps!.map((subStep, subIndex) => {
                      const subIsCurrent = subStep.status === 'running'
                      const subIsPast = subStep.status === 'success'

                      return (
                        <div
                          key={subStep.id}
                          className="flex items-center gap-3 py-1.5 fade-in-up"
                          style={{ animationDelay: `${subIndex * 50}ms` }}
                        >
                          {/* 子步骤节点 */}
                          <div className="relative w-6 h-6 shrink-0 flex items-center justify-center">
                            {subIsCurrent
                              ? (
                                  <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                                    <Loader2 size={12} className="text-white spin" />
                                  </div>
                                )
                              : subIsPast
                                ? (
                                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                                      <Check size={12} className="text-white" />
                                    </div>
                                  )
                                : subStep.status === 'failed'
                                  ? (
                                      <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                                        <XCircle size={12} className="text-white" />
                                      </div>
                                    )
                                  : (
                                      <div className="w-5 h-5 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                                        <Circle size={8} className="text-gray-300" />
                                      </div>
                                    )}
                          </div>

                          {/* 子步骤内容 */}
                          <div className="flex-1 flex items-center justify-between min-w-0">
                            <p className={`text-xs truncate ${subIsCurrent ? 'font-medium text-gray-800' : subIsPast ? 'text-gray-600' : 'text-gray-400'}`}>
                              {subStep.label}
                            </p>
                            {subStep.error && (
                              <span className="shrink-0 text-xs text-red-500 ml-2">{subStep.error}</span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default ProgressDisplay
