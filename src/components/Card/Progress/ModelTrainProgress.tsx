import type { ApoResponseModelTrainIndex } from '../../Session/types'

import * as React from 'react'

/** 训练阶段类型 */
export type TrainStage = 1 | 2 | 3 | 4 | 5

interface ModelTrainProgressProps {
  title: string
  stage: TrainStage
  data: Omit<ApoResponseModelTrainIndex, 'stage' | 'trainStage' | 'status' | 'title'>
}

interface StageConfig {
  id: string
  title: string
  subtitle: string
  icon: string
  iconAnim: string
  color: 'blue' | 'amber' | 'emerald' | 'violet'
  showPulse: boolean
  showProgress?: boolean
  label: string
  expandable?: boolean
}

const stages: Record<TrainStage, StageConfig> = {
  1: {
    id: 'initializing',
    title: '模型训练启动中',
    subtitle: '正在准备训练环境',
    icon: 'Loader2',
    iconAnim: 'animate-spin',
    color: 'blue',
    showPulse: true,
    label: '启动中',
  },
  2: {
    id: 'training',
    title: '模型训练中',
    subtitle: '正在训练模型',
    icon: 'Brain',
    iconAnim: '',
    color: 'amber',
    showPulse: true,
    showProgress: true,
    label: '训练中',
  },
  3: {
    id: 'completed',
    title: '模型训练成功',
    subtitle: '模型已准备就绪',
    icon: 'CheckCircle2',
    iconAnim: '',
    color: 'emerald',
    showPulse: false,
    label: '已完成',
    expandable: true,
  },
  4: {
    id: 'registering',
    title: '模型注册中',
    subtitle: '正在上传至模型仓库',
    icon: 'CloudUpload',
    iconAnim: '',
    color: 'violet',
    showPulse: true,
    label: '注册中',
  },
  5: {
    id: 'registered',
    title: '模型注册成功',
    subtitle: '模型已上线可用',
    icon: 'BadgeCheck',
    iconAnim: '',
    color: 'emerald',
    showPulse: false,
    label: '已注册',
  },
}

const colorMap = {
  blue: {
    bg: 'bg-blue-50',
    bgSolid: 'bg-blue-500',
    text: 'text-blue-600',
    border: 'border-blue-100',
    pulse: 'bg-blue-400',
    progressBg: 'bg-blue-100',
    progressFill: 'bg-blue-500',
  },
  amber: {
    bg: 'bg-amber-50',
    bgSolid: 'bg-amber-500',
    text: 'text-amber-600',
    border: 'border-amber-100',
    pulse: 'bg-amber-400',
    progressBg: 'bg-amber-100',
    progressFill: 'bg-amber-500',
  },
  emerald: {
    bg: 'bg-emerald-50',
    bgSolid: 'bg-emerald-500',
    text: 'text-emerald-600',
    border: 'border-emerald-100',
    pulse: 'bg-emerald-400',
    progressBg: 'bg-emerald-100',
    progressFill: 'bg-emerald-500',
  },
  violet: {
    bg: 'bg-violet-50',
    bgSolid: 'bg-violet-500',
    text: 'text-violet-600',
    border: 'border-violet-100',
    pulse: 'bg-violet-400',
    progressBg: 'bg-violet-100',
    progressFill: 'bg-violet-500',
  },
}

// 图标组件
const icons: Record<string, React.FC<{ className?: string }>> = {
  Loader2: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  Brain: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54" />
    </svg>
  ),
  CheckCircle2: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  CloudUpload: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
      <path d="M12 12v9" />
      <path d="m16 16-4-4-4 4" />
    </svg>
  ),
  BadgeCheck: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  ChevronDown: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),
  ChevronUp: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m18 15-6-6-6 6" />
    </svg>
  ),
}

// 格式化文件大小
function formatFileSize(bytes?: number): string {
  if (!bytes)
    return '-'
  if (bytes >= 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${(bytes / 1024).toFixed(1)} KB`
}

// 格式化训练时长
function formatElapsedMs(ms?: number): string {
  if (!ms)
    return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) {
    return `${hours} 小时 ${minutes % 60} 分`
  }
  if (minutes > 0) {
    return `${minutes} 分 ${seconds % 60} 秒`
  }
  return `${seconds} 秒`
}

const ModelTrainProgress: React.FC<ModelTrainProgressProps> = ({ title, stage, data }) => {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const config = stages[stage]
  const colors = colorMap[config.color]
  const IconComponent = icons[config.icon]

  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsExpanded(!isExpanded)
  }

  // 根据阶段生成数据项
  const getDataItems = (): Array<{ label: string, value: string, mono?: boolean }> => {
    switch (stage) {
      case 1:
        return [
          { label: '模型代号', value: data.modelCode || '-' },
          { label: '训练方法', value: data.method || '-' },
          { label: '模型架构', value: data.architecture || 'Transformer' },
        ]
      case 2:
        return [
          { label: '模型代号', value: data.modelCode || '-' },
          { label: '当前轮次', value: `${data.currentEpoch || 1} / ${data.totalEpochs || 1}` },
          { label: '训练进度', value: `${data.progress || 0}%` },
        ]
      case 3:
        return [
          { label: '模型代号', value: data.modelCode || '-' },
          { label: '产出体积', value: data.outputSize || '-' },
          { label: '文件位置', value: data.fileLocation || '-', mono: true },
        ]
      case 4:
        return [
          { label: '模型代号', value: data.modelCode || '-' },
          { label: '目标仓库', value: data.targetRegistry || '模型中心' },
          { label: 'RAG 索引', value: data.ragIndex || '-' },
        ]
      case 5:
        return [
          { label: '模型 ID', value: data.modelId || '-', mono: true },
          { label: '版本号', value: data.version || 'v1.0.0' },
          { label: '推理端点', value: data.inferEndpoint || '-', mono: true },
        ]
      default:
        return []
    }
  }

  // 展开数据
  const getExpandData = (): Array<{ label: string, value: string }> => {
    switch (stage) {
      case 2:
        return [
          { label: '损失值', value: '计算中...' },
          { label: '学习率', value: '2e-5' },
        ]
      case 3:
        return [
          { label: '关联 RAG', value: data.ragIndex || '-' },
          { label: '训练时长', value: formatElapsedMs(data.elapsedMs) },
          { label: '准确率', value: data.accuracy ? `${(data.accuracy * 100).toFixed(2)}%` : '-' },
        ]
      case 5:
        return [
          { label: '文件大小', value: formatFileSize(data.fileSize) },
          { label: '本地存在', value: data.existsLocal ? '是' : '否' },
        ]
      default:
        return []
    }
  }

  const dataItems = getDataItems()
  const expandData = getExpandData()
  const progress = data.progress || 30

  return (
    <div className="w-140 min-h-42.5 bg-white rounded-2xl shadow-sm border border-slate-100/80 transition-all duration-300 hover:shadow-md">
      <style>
        {`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-pulse-ring { animation: pulse-ring 1.5s ease-out infinite; }
        .animate-fade-up { animation: fade-up 0.4s ease-out forwards; }
        .animate-scale-in { animation: scale-in 0.3s ease-out forwards; }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
      `}
      </style>

      <div className="p-6 animate-scale-in">
        <div className="flex items-start gap-5">
          {/* Status Icon */}
          <div className="relative shrink-0">
            <div className={`w-12 h-12 ${colors.bg} ${colors.border} border rounded-xl flex items-center justify-center`}>
              <IconComponent className={`w-5 h-5 ${colors.text} ${config.iconAnim}`} />
            </div>
            {config.showPulse && (
              <div className="absolute -top-0.5 -right-0.5">
                <div className={`w-2.5 h-2.5 ${colors.bgSolid} rounded-full`} />
                <div className={`absolute inset-0 w-2.5 h-2.5 ${colors.pulse} rounded-full animate-pulse-ring`} />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900 mb-0.5">{config.title}</h2>
                <p className="text-xs text-slate-400">{title || config.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                {config.expandable && expandData.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleExpand}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <span>{isExpanded ? '收起详情' : '展开详情'}</span>
                    {isExpanded
                      ? <icons.ChevronUp className="w-3 h-3" />
                      : <icons.ChevronDown className="w-3 h-3" />}
                  </button>
                )}
                <span className={`px-2.5 py-1 ${colors.bg} ${colors.text} text-[10px] font-semibold tracking-wider rounded-full`}>
                  {config.label}
                </span>
              </div>
            </div>

            {/* Data Row */}
            <div className="flex items-center gap-6">
              {dataItems.map((item, idx) => (
                <React.Fragment key={item.label}>
                  <div className={`opacity-0 animate-fade-up delay-${(idx + 1) * 100}`}>
                    <p className="text-[10px] font-medium text-slate-400 tracking-wider mb-1">{item.label}</p>
                    <p className={`text-sm font-medium text-slate-700 ${item.mono ? 'font-mono text-xs' : ''}`}>
                      {item.value}
                    </p>
                  </div>
                  {idx < dataItems.length - 1 && <div className="w-px h-10 bg-slate-100" />}
                </React.Fragment>
              ))}
            </div>

            {/* Progress Bar */}
            {config.showProgress && (
              <div className="mt-4 opacity-0 animate-fade-up delay-300">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-medium text-slate-400 tracking-wider">训练进度</span>
                  <span className={`text-xs font-semibold ${colors.text}`}>
                    {progress}
                    %
                  </span>
                </div>
                <div className={`h-1.5 ${colors.progressBg} rounded-full overflow-hidden`}>
                  <div
                    className={`h-full ${colors.progressFill} rounded-full transition-all duration-1000`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Expanded Data */}
            {config.expandable && isExpanded && expandData.length > 0 && (
              <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 animate-fade-up">
                {expandData.map((item, idx) => (
                  <React.Fragment key={item.label}>
                    <div>
                      <p className="text-[10px] font-medium text-slate-400 tracking-wider mb-1">{item.label}</p>
                      <p className="text-sm font-medium text-slate-700">{item.value}</p>
                    </div>
                    {idx < expandData.length - 1 && <div className="w-px h-10 bg-slate-100" />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModelTrainProgress
