import type * as React from 'react'
import { Check } from 'lucide-react'

import { useState } from 'react'

import { useStore } from '@/components/Session/store'

export const WorkFlowQuestions: React.FC = () => {
  const { clarificationQuestions, fetchMessage } = useStore()
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [currentIndex, setCurrentIndex] = useState(0)

  // 当前问题
  const currentQuestion = clarificationQuestions[currentIndex]

  // 已选择数量
  const selectedCount = Object.keys(selectedOptions).length

  // 判断所有问题是否都已选择
  const allSelected = clarificationQuestions.length > 0
    && clarificationQuestions.every(q => selectedOptions[q.id])

  // 处理选项点击
  const handleOptionClick = (questionId: string, optionValue: string) => {
    setSelectedOptions(prev => ({ ...prev, [questionId]: optionValue }))
    // 自动跳到下一个问题
    if (currentIndex < clarificationQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1)
    }
  }

  // 处理确定按钮点击
  const handleConfirm = () => {
    if (!allSelected)
      return
    // 组合所有选中的答案
    const answers = clarificationQuestions
      .map((q) => {
        const selectedValue = selectedOptions[q.id]
        const selectedOption = q.options.find(opt => opt.value === selectedValue)
        return selectedOption?.label || ''
      })
      .filter(Boolean)
      .join('；')

    fetchMessage(answers)
    // 清空选择
    setSelectedOptions({})
    setCurrentIndex(0)
  }

  if (!currentQuestion)
    return null

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden shrink-0">
      {/* Tab 导航 */}
      <div className="flex border-b border-gray-200">
        {clarificationQuestions.map((question, index) => {
          const isSelected = selectedOptions[question.id]
          const isActive = index === currentIndex

          return (
            <button
              key={question.id}
              onClick={() => setCurrentIndex(index)}
              className={`
                flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium
                transition-all duration-200
                ${isActive
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
              `}
            >
              <span>
                问题
                {' '}
                {index + 1}
              </span>
              {isSelected && <Check size={14} className="text-green-500" />}
            </button>
          )
        })}
      </div>

      {/* 问题选择区 */}
      <div className="p-5">
        <h3 className="text-lg font-medium text-gray-800 mb-4">{currentQuestion.question}</h3>

        <div className="space-y-2">
          {currentQuestion.options.map((opt) => {
            const isOptionSelected = selectedOptions[currentQuestion.id] === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleOptionClick(currentQuestion.id, opt.value)}
                className={`
                  w-full px-4 py-3 rounded-lg text-left font-medium
                  transition-all duration-200
                  flex items-center justify-between gap-3
                  ${isOptionSelected
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                `}
              >
                <span>{opt.label}</span>
                {isOptionSelected && <Check size={18} />}
              </button>
            )
          })}
        </div>
      </div>

      {/* 分割线 */}
      <div className="border-t border-gray-200" />

      {/* 提交操作区 */}
      <div className="p-4 bg-gray-50">
        {/* 进度提示 */}
        <div className="flex items-center justify-between mb-3 text-sm">
          <span className="text-gray-600">
            已选择
            <span className="font-semibold text-gray-900 mx-1">{selectedCount}</span>
            /
            {clarificationQuestions.length}
            {' '}
            个问题
          </span>
          {allSelected && (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <Check size={16} />
              可以提交
            </span>
          )}
        </div>

        {/* 提交按钮 */}
        <button
          onClick={handleConfirm}
          disabled={!allSelected}
          className={`
            w-full py-3 rounded-lg transition-all duration-200 font-semibold
            flex items-center justify-center gap-2
            ${allSelected
      ? 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow cursor-pointer'
      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
          `}
        >
          <Check size={18} />
          提交答案
        </button>
      </div>
    </div>
  )
}

export default WorkFlowQuestions
