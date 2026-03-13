import type * as React from 'react'
import { Send } from 'lucide-react'

import { useState } from 'react'
import useStore from '../store'

function Input() {
  const [value, setValue] = useState('')
  const { fetchMessage } = useStore()

  const isEmpty = !value.trim()

  const handleSend = async () => {
    if (isEmpty)
      return
    await fetchMessage(value.trim())
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl + Enter 或 Cmd + Enter 发送
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSend()
    }
  }

  const charCount = value.length
  const maxChars = 2000
  const isNearLimit = charCount > maxChars * 0.9
  const isOverLimit = charCount > maxChars

  return (
    <div className="bg-white rounded-xl border-1 border-gray-200 shadow-sm overflow-hidden shrink-0">
      {/* 输入区域 */}
      <div className="p-4">
        <textarea
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg resize-none
            focus:outline-none focus:ring-2 focus:ring-blue-700 focus:bg-white focus:border-transparent
            transition-all duration-200"
          rows={4}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="请输入您的问题... (Ctrl + Enter 发送)"
          maxLength={maxChars}
        />
      </div>

      {/* 分割线 */}
      <div className="border-t border-gray-200" />

      {/* 底部操作区 */}
      <div className="p-4 bg-gray-50">
        {/* 字数统计和提示 */}
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className={isOverLimit ? 'text-red-500' : 'text-gray-500'}>
            {charCount}
            {' '}
            /
            {maxChars}
          </span>
          {value.trim() && !isOverLimit && (
            <span className="text-gray-400">
              按 Ctrl + Enter 发送
            </span>
          )}
          {isNearLimit && !isOverLimit && (
            <span className="text-orange-500">
              即将达到字数限制
            </span>
          )}
          {isOverLimit && (
            <span className="text-red-500 font-medium">
              已超过字数限制
            </span>
          )}
        </div>

        {/* 发送按钮 */}
        <button
          onClick={handleSend}
          disabled={isEmpty || isOverLimit}
          className={`
            w-full py-3 rounded-lg transition-all duration-200 font-semibold
            flex items-center justify-center gap-2
            ${isEmpty || isOverLimit
      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
      : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow cursor-pointer'}
          `}
        >
          <Send size={18} />
          发送消息
        </button>
      </div>
    </div>
  )
}

export default Input
