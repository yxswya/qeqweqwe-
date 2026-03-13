import type * as React from 'react'
import { useState } from 'react'

export interface TabItem {
  id: string
  label: string
  content: React.ReactNode
  icon?: React.ReactNode
  disabled?: boolean
}

interface TabsProps {
  tabs: TabItem[]
  defaultActiveId?: string
  variant?: 'line' | 'card' | 'pill'
  size?: 'sm' | 'md' | 'lg'
  onChange?: (activeId: string) => void
  className?: string
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  defaultActiveId,
  variant = 'line',
  size = 'md',
  onChange,
  className = '',
}) => {
  const [activeId, setActiveId] = useState(defaultActiveId || tabs[0]?.id)

  const handleTabChange = (id: string) => {
    const tab = tabs.find(t => t.id === id)
    if (tab?.disabled)
      return

    setActiveId(id)
    onChange?.(id)
  }

  const activeTab = tabs.find(t => t.id === activeId)

  // 尺寸样式
  const sizeStyles = {
    sm: 'text-xs px-3 py-2',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-5 py-3',
  }

  // 获取 tab 按钮样式
  const getTabClassName = (tab: TabItem) => {
    const base = `
      flex items-center justify-center gap-2 font-medium whitespace-nowrap flex-1
      transition-all duration-300 ease-out
      ${sizeStyles[size]}
      ${tab.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
    `

    if (variant === 'line') {
      // line 变体：始终预留 border 空间，只改变颜色
      const isActive = activeId === tab.id
      return `
        ${base}
        border-b-2
        ${isActive
          ? 'text-blue-600 border-blue-600'
          : 'text-gray-500 border-transparent hover:text-gray-700'}
      `
    }

    if (variant === 'card') {
      // card 变体
      const isActive = activeId === tab.id
      return `
        ${base}
        border-b-2 -mb-px
        ${isActive
          ? 'text-blue-600 bg-white border-blue-600'
          : 'text-gray-500 border-transparent hover:bg-gray-50 hover:text-gray-700'}
      `
    }

    // pill 变体
    const isActive = activeId === tab.id
    return `
      ${base}
      ${isActive
        ? 'text-blue-600 bg-blue-50 shadow-sm'
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}
    `
  }

  // 容器样式
  const containerClassName = {
    line: 'border-b border-gray-200',
    card: '',
    pill: 'bg-gray-50 rounded-lg p-1 gap-1',
  }

  return (
    <div className={className}>
      <style>
        {`
        .tabs-content {
          animation: fadeIn 0.25s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}
      </style>

      {/* Tab 头部 */}
      <div className={`flex ${containerClassName[variant]}`}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={getTabClassName(tab)}
          >
            {tab.icon && <span className="shrink-0 transition-transform duration-300 group-hover:scale-110">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      <div className="mt-4 tabs-content">
        {activeTab?.content}
      </div>
    </div>
  )
}

export default Tabs
