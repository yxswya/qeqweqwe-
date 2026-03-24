import type { CanvasNode as CanvasNodeType } from '@/api/modules/canvas'
import * as React from 'react'
import { Box, Database, File, MessageSquare, Sparkles } from 'lucide-react'

interface CanvasNodeProps {
  node: CanvasNodeType
  position: { x: number, y: number }
  isSelected?: boolean
  onClick?: () => void
}

const nodeTypeConfig: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  bgColor: string
  borderColor: string
  iconColor: string
  titleColor: string
  label: string
}> = {
  session: {
    icon: MessageSquare,
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-700',
    label: '会话',
  },
  rag: {
    icon: Database,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    iconColor: 'text-emerald-500',
    titleColor: 'text-emerald-700',
    label: '知识库',
  },
  model: {
    icon: Box,
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    iconColor: 'text-indigo-500',
    titleColor: 'text-indigo-700',
    label: '模型',
  },
  train: {
    icon: Sparkles,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    iconColor: 'text-amber-500',
    titleColor: 'text-amber-700',
    label: '训练',
  },
  file: {
    icon: File,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    iconColor: 'text-purple-500',
    titleColor: 'text-purple-700',
    label: '文件',
  },
}

const CanvasNodeComponent: React.FC<CanvasNodeProps> = ({ node, position, isSelected, onClick }) => {
  const config = nodeTypeConfig[node.type] || nodeTypeConfig.session
  const Icon = config.icon

  const formatDate = (dateStr: string | Date | null | undefined): string => {
    if (!dateStr)
      return ''
    try {
      const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr
      return date.toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
    catch {
      return ''
    }
  }

  return (
    <div
      className={`absolute w-52 p-4 rounded-2xl border-2 bg-white shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : 'hover:scale-102'
      } ${config.borderColor}`}
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
      onClick={onClick}
    >
      {/* 类型标签 */}
      <div className={`absolute -top-2 left-4 px-2 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.iconColor} border ${config.borderColor}`}>
        {config.label}
      </div>

      <div className="flex items-center gap-3 mt-1">
        <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
          <Icon className={`w-5 h-5 ${config.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm truncate ${config.titleColor}`} title={node.title}>
            {node.title}
          </div>
          {node.createdAt && (
            <div className="text-xs text-slate-400 mt-0.5">
              {formatDate(node.createdAt)}
            </div>
          )}
        </div>
      </div>

      {/* 额外信息提示 */}
      {node.data && Object.keys(node.data).length > 0 && (
        <div className="mt-2 pt-2 border-t border-slate-100">
          <div className="text-xs text-slate-400">
            点击查看详情
          </div>
        </div>
      )}
    </div>
  )
}

export default CanvasNodeComponent
