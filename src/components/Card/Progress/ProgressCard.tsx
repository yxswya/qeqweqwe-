import * as React from 'react'

export interface ProgressCardProps {
  /** 标题 */
  title: string
  /** 状态描述 */
  statusText: string
  /** 进度条下方的说明文字 */
  progressLabel: string
  /** 状态标签文字 */
  statusLabel: string
  /** 是否为进行中状态 */
  isPending: boolean
  /** 主题色 */
  themeColor: 'blue' | 'indigo' | 'green'
  /** 自定义图标（进行中时） */
  pendingIcon?: React.ReactNode
  /** 自定义图标（完成时） */
  completeIcon?: React.ReactNode
}

const themeConfig = {
  blue: {
    iconBg: 'bg-blue-500',
    spinnerBorder: 'border-blue-500',
    progressBg: 'bg-blue-500',
    textPrimary: 'text-blue-500',
  },
  indigo: {
    iconBg: 'bg-indigo-500',
    spinnerBorder: 'border-indigo-500',
    progressBg: 'bg-indigo-500',
    textPrimary: 'text-indigo-500',
  },
  green: {
    iconBg: 'bg-green-500',
    spinnerBorder: 'border-green-500',
    progressBg: 'bg-green-500',
    textPrimary: 'text-green-500',
  },
}

const defaultCompleteIcon = (
  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const ProgressCard: React.FC<ProgressCardProps> = ({
  title,
  statusText,
  progressLabel,
  statusLabel,
  isPending,
  themeColor,
  pendingIcon,
  completeIcon,
}) => {
  const theme = themeConfig[themeColor]

  return (
    <div className="w-80 bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="relative w-10 h-10 flex-shrink-0">
          {isPending
            ? (
                <>
                  <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
                  <div className={`absolute inset-0 rounded-full border-2 ${theme.spinnerBorder} border-t-transparent animate-spin`} />
                  <div className={`absolute inset-2 rounded-full ${theme.iconBg} flex items-center justify-center`}>
                    {pendingIcon}
                  </div>
                </>
              )
            : (
                <div className={`w-10 h-10 rounded-full ${theme.iconBg} flex items-center justify-center`}>
                  {completeIcon || defaultCompleteIcon}
                </div>
              )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 truncate">
            {title}
          </h3>
          <p className={`text-xs ${theme.textPrimary} font-medium`}>
            {statusText}
          </p>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${theme.progressBg} rounded-full ${isPending ? 'animate-pulse' : ''}`}
            style={{ width: isPending ? '60%' : '100%' }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{progressLabel}</span>
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 ${isPending ? 'bg-green-400 animate-pulse' : 'bg-green-400'} rounded-full`} />
            {statusLabel}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProgressCard
