import type { ApoResponseModelTrainIndex } from '../../Session/types'

import * as React from 'react'
import { createPortal } from 'react-dom'

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
  statusText: string
  icon: string
  anim: 'spin' | 'pulse' | 'none'
  color: 'amber' | 'blue' | 'emerald' | 'violet' | 'teal'
  showProgress?: boolean
  showAction?: boolean
  actionText?: string
  showBouncingDots?: boolean
}

const stages: Record<TrainStage, StageConfig> = {
  1: {
    id: 'initializing',
    title: '模型启动中',
    subtitle: 'GPT-4-FINETUNE-2024',
    statusText: '准备中',
    icon: 'Loader2',
    anim: 'spin',
    color: 'amber',
  },
  2: {
    id: 'training',
    title: '模型训练中',
    subtitle: '',
    statusText: '进行中',
    icon: '',
    anim: 'none',
    color: 'blue',
    showProgress: true,
  },
  3: {
    id: 'completed',
    title: '训练完成',
    subtitle: '等待注册至模型仓库',
    statusText: '成功',
    icon: 'Check',
    anim: 'none',
    color: 'emerald',
  },
  4: {
    id: 'registering',
    title: '模型注册中',
    subtitle: '正在上传至模型仓库',
    statusText: '发布中',
    icon: 'Upload',
    anim: 'pulse',
    color: 'violet',
    showBouncingDots: true,
  },
  5: {
    id: 'registered',
    title: '注册成功',
    subtitle: '',
    statusText: '已上线',
    icon: 'BadgeCheck',
    anim: 'none',
    color: 'teal',
    showAction: true,
    actionText: '打开',
  },
}

const colorMap = {
  amber: {
    bg: 'bg-amber-50',
    text: 'text-amber-500',
    ring: 'bg-amber-400/20',
    badge: 'bg-amber-50 text-amber-600',
  },
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-500',
    ring: 'bg-blue-400/20',
    badge: 'bg-blue-50 text-blue-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-500',
    ring: 'bg-emerald-400/20',
    badge: 'bg-emerald-50 text-emerald-600',
  },
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-500',
    ring: 'bg-violet-400/20',
    badge: 'bg-violet-50 text-violet-600',
    dot: 'bg-violet-400',
  },
  teal: {
    bg: 'bg-teal-50',
    text: 'text-teal-500',
    ring: 'bg-teal-400/20',
    badge: 'bg-teal-50 text-teal-600',
    actionBg: 'bg-teal-50 hover:bg-teal-100',
    actionText: 'text-teal-600',
  },
}

// 图标组件
const icons: Record<string, React.FC<{ className?: string }>> = {
  Loader2: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  Check: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Upload: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17,8 12,3 7,8" />
      <line x1="12" y1="3" x2="12" y2="15" />
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
  ExternalLink: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15,3 21,3 21,9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Database: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  ),
  Cpu: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  ),
  Link: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  ),
  Copy: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Terminal: ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4,17 10,11 4,5" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  ),
}

// 格式化训练时长
function formatElapsedMs(ms?: number): string {
  if (!ms)
    return '-'
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  if (hours > 0) {
    return `${hours}小时${minutes % 60}分`
  }
  if (minutes > 0) {
    return `${minutes}分${seconds % 60}秒`
  }
  return `${seconds}秒`
}

const ModelTrainProgress: React.FC<ModelTrainProgressProps> = ({ title, stage, data }) => {
  const config = stages[stage]
  const colors = colorMap[config.color]
  const IconComponent = config.icon ? icons[config.icon] : null
  const progress = data.progress || 64

  const cardRef = React.useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)
  const [cardRect, setCardRect] = React.useState<DOMRect | null>(null)

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      setCardRect(rect)
    }
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleUseModel = () => {
    console.log('Navigate to model inference page')
  }

  // 渲染图标区域
  const renderIcon = () => {
    if (stage === 2) {
      // 训练中：圆环进度条
      const circumference = 2 * Math.PI * 20
      return (
        <div className="relative mr-5">
          <svg className="w-12 h-12" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#dbeafe" strokeWidth={3} />
            <circle
              cx="24"
              cy="24"
              r="20"
              fill="none"
              stroke="#3b82f6"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={`${circumference * progress / 100} ${circumference}`}
              style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">
              {progress}
              %
            </span>
          </div>
        </div>
      )
    }

    return (
      <div className="relative mr-5">
        {config.anim === 'pulse' && <div className={`absolute inset-0 ${colors.ring} rounded-full animate-pulse-ring`} />}
        <div className={`relative w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center`}>
          {IconComponent && (
            <IconComponent className={`w-5 h-5 ${colors.text} ${config.anim === 'spin' ? 'animate-spin-slow' : ''}`} />
          )}
        </div>
      </div>
    )
  }

  // 渲染右侧区域
  const renderRightSection = () => {
    if (stage === 2) {
      // 训练中：显示剩余时间（使用elapsedMs估算）
      return (
        <div className="ml-5 text-right">
          <span className="text-xs text-slate-400">已训练</span>
          <p className="text-sm font-medium text-slate-600">{formatElapsedMs(data.elapsedMs)}</p>
        </div>
      )
    }

    if (stage === 3) {
      // 训练完成：显示耗时
      return (
        <div className="text-right">
          <span className="text-xs text-slate-400">耗时</span>
          <p className="text-sm font-medium text-slate-600">{formatElapsedMs(data.elapsedMs)}</p>
        </div>
      )
    }

    if (stage === 4) {
      // 注册中：跳动点
      return (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className={`w-1.5 h-1.5 ${colorMap.violet.dot} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
            <span className={`w-1.5 h-1.5 ${colorMap.violet.dot} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
            <span className={`w-1.5 h-1.5 ${colorMap.violet.dot} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )
    }

    if (stage === 5) {
      // 注册成功：打开按钮
      const tealColors = colorMap.teal
      return (
        <button
          type="button"
          onClick={handleUseModel}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium ${tealColors.actionText} ${tealColors.actionBg} rounded-lg transition-colors`}
        >
          <icons.ExternalLink className="w-3.5 h-3.5" />
          {config.actionText}
        </button>
      )
    }

    // 默认：下拉箭头
    return (
      <div className="flex items-center gap-2 text-slate-300">
        <icons.ChevronDown className="w-4 h-4" />
      </div>
    )
  }

  // 渲染详情卡片内容
  const renderDetailContent = () => {
    switch (stage) {
      case 1:
        return (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">模型代号</span>
                <p className="text-sm text-slate-700 font-mono">{data.modelCode || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">基础模型</span>
                <p className="text-sm text-slate-700">{data.method || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">参数量</span>
                <p className="text-sm text-slate-700">{data.architecture || 'Transformer'}</p>
              </div>
            </div>
          </div>
        )
      case 2:
        return (
          <div className="p-5">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">训练轮次</span>
                <p className="text-sm text-slate-700 font-medium">
                  {data.currentEpoch || 1}
                  {' '}
                  /
                  {' '}
                  {data.totalEpochs || 1}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">准确率</span>
                <p className="text-sm text-slate-700 font-mono">
                  {data.accuracy ? `${(data.accuracy * 100).toFixed(2)}%` : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">学习率</span>
                <p className="text-sm text-slate-700 font-mono">2e-5</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">批次大小</span>
                <p className="text-sm text-slate-700">32</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <icons.Database className="w-3.5 h-3.5" />
                12,450 条样本
              </span>
              <span className="flex items-center gap-1.5">
                <icons.Cpu className="w-3.5 h-3.5" />
                8x A100 GPU
              </span>
            </div>
          </div>
        )
      case 3:
        return (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">输出路径</span>
                <p className="text-sm text-slate-700 font-mono truncate">{data.fileLocation || '/models/ft-abc123'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">模型体积</span>
                <p className="text-sm text-slate-700">{data.outputSize || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">准确率</span>
                <p className="text-sm text-slate-700 font-mono">
                  {data.accuracy ? `${(data.accuracy * 100).toFixed(2)}%` : '-'}
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <icons.Link className="w-3.5 h-3.5" />
                  关联知识库
                </span>
                <span className="text-xs font-medium text-emerald-600">{data.ragIndex || '-'}</span>
              </div>
            </div>
          </div>
        )
      case 4:
        return (
          <div className="p-5">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">目标仓库</span>
                <p className="text-sm text-slate-700">{data.targetRegistry || '生产环境中心'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">版本号</span>
                <p className="text-sm text-slate-700">{data.version || 'v1.0.0'}</p>
              </div>
            </div>
          </div>
        )
      case 5:
        return (
          <div className="p-5">
            <div className="grid grid-cols-3 gap-6">
              <div className="space-y-1">
                <span className="text-xs text-slate-400">接口地址</span>
                <p className="text-sm text-slate-700 font-mono truncate">{data.inferEndpoint || '-'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">文件大小</span>
                <p className="text-sm text-slate-700 font-mono">
                  {data.fileSize ? `${(data.fileSize / 1024 / 1024).toFixed(2)} MB` : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-slate-400">运行状态</span>
                <p className="text-sm text-teal-600 font-medium flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                  运行中
                </p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <icons.Copy className="w-3.5 h-3.5" />
                复制 ID
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <icons.Terminal className="w-3.5 h-3.5" />
                测试接口
              </button>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <>
      <style>
        {`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.4); opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes progress-flow {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-pulse-ring {
          animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
        .progress-animated {
          background: linear-gradient(90deg, #3b82f6, #60a5fa, #3b82f6);
          background-size: 200% 100%;
          animation: progress-flow 1.5s ease infinite;
        }
        .detail-card-animate {
          transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        `}
      </style>

      {/* 主卡片 */}
      <div
        ref={cardRef}
        className="relative bg-white rounded-xl border border-slate-200 overflow-hidden"
        style={{ width: 560, height: 100 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="flex items-center h-full px-6">
          {/* 图标区域 */}
          {renderIcon()}

          {/* 内容区域 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-800">{config.title}</span>
              <span className={`px-2 py-0.5 text-xs font-medium ${colors.badge} rounded`}>{config.statusText}</span>
            </div>

            {/* 训练中：显示进度条 */}
            {stage === 2 && (
              <div className="mt-2.5 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full progress-animated rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* 其他阶段：显示副标题 */}
            {stage !== 2 && (
              <p className="text-sm text-slate-400 mt-1">{title || config.subtitle}</p>
            )}

            {/* 注册成功：显示模型ID */}
            {stage === 5 && data.modelId && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-slate-400">模型 ID</span>
                <code className="text-sm font-mono text-teal-600 bg-teal-50 px-2 py-0.5 rounded">{data.modelId}</code>
              </div>
            )}
          </div>

          {/* 右侧区域 */}
          {renderRightSection()}
        </div>
      </div>

      {/* 详情卡片 - 使用 Portal 渲染到 body */}
      {isHovered && cardRect && createPortal(
        <div
          className="detail-card-animate fixed bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xl z-[9999]"
          style={{
            left: cardRect.left,
            top: cardRect.bottom + 8,
            width: cardRect.width,
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {renderDetailContent()}
        </div>,
        document.body
      )}
    </>
  )
}

export default ModelTrainProgress
