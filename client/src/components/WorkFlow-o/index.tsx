import * as React from 'react'
import ClarificationWidget from './ClarificationWidget'

// ==================== 类型定义 ====================

interface Option {
  value: string
  label: string
}

interface ClarificationQuestion {
  id: string
  question: string
  question_type: string
  slot: string
  options: Option[]
}

interface ApiResponse {
  stage: string
  answer?: {
    next_action?: string
    clarification_questions?: ClarificationQuestion[]
  }
  workflow_hint?: {
    reason?: string
    stage?: string
  }
}

// 列表项类型（添加唯一 ID）
interface ListItem extends ApiResponse {
  id: string
}

interface WorkFlowProps {
  initialData?: ApiResponse
}

// ==================== 组件 ====================

const WorkFlow: React.FC<WorkFlowProps> = ({ initialData }) => {
  // API 相关状态
  const [loading, setLoading] = React.useState<boolean>(false)
  const [apiResponse, setApiResponse] = React.useState<ApiResponse | null>(initialData || null)
  const [apiQuestions, setApiQuestions] = React.useState<ClarificationQuestion[]>([])
  const [list, setList] = React.useState<ListItem[]>([])

  // 是否需要更多信息（直接状态，不依赖 list）
  const [needMoreInfo, setNeedMoreInfo] = React.useState<boolean>(false)

  // 检查是否是初始状态（list 为空）
  const isInitialState = list.length === 0

  // 清除问题数据和状态
  const clearQuestions = React.useCallback(() => {
    setApiQuestions([])
    setApiResponse(null)
    setNeedMoreInfo(false)
  }, [])

  // 生成唯一 ID
  const generateId = React.useCallback(() => {
    return `item-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }, [])

  // 发送 API 请求
  const send = (text: string) => {
    setLoading(true)
    fetch('http://localhost:3000', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
      }),
    })
      .then(res => res.json())
      .then((res: ApiResponse) => {
        setApiResponse(res)
        // 保存到历史记录列表
        const listItem: ListItem = {
          ...res,
          id: generateId(),
        }
        setList(arr => [...arr, listItem])

        // 如果返回的是澄清问题阶段，提取问题数据
        if (res.stage === 'completeness' && res.answer?.clarification_questions) {
          setApiQuestions(res.answer.clarification_questions)
        }

        // 检查是否需要更多信息
        if (res.workflow_hint?.stage === 'need_more_info') {
          setNeedMoreInfo(true)
        }
      })
      .catch((error) => {
        console.error('API 请求失败:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  // ==================== 调试函数 ====================

  // 调试：手动调起输入框
  const handleDebugShowInput = React.useCallback(() => {
    // 先设置 needMoreInfo 状态
    setNeedMoreInfo(true)

    // 使用 setTimeout 确保状态更新顺序，避免时序问题
    setTimeout(() => {
      const listItem: ListItem = {
        stage: 'debug',
        id: generateId(),
        workflow_hint: {
          stage: 'need_more_info',
          reason: '调试：手动调起输入框',
        },
      }
      setList(arr => [...arr, listItem])
    }, 0)
  }, [generateId])

  // 调试：手动调起问题选择框
  const handleDebugShowQuestions = React.useCallback(() => {
    // 先设置问题数据
    setApiQuestions([
      {
        id: '1',
        question: '您的主要使用场景是什么？',
        question_type: 'choice',
        slot: 'use_case',
        options: [
          { value: 'personal', label: '个人使用' },
          { value: 'team', label: '团队协作' },
          { value: 'enterprise', label: '企业级应用' },
        ],
      },
      {
        id: '2',
        question: '您最关注的特性是什么？',
        question_type: 'choice',
        slot: 'feature',
        options: [
          { value: 'performance', label: '性能' },
          { value: 'security', label: '安全性' },
          { value: 'usability', label: '易用性' },
        ],
      },
    ])

    // 使用 setTimeout 确保状态更新顺序
    setTimeout(() => {
      const listItem: ListItem = {
        stage: 'debug',
        id: generateId(),
        workflow_hint: {
          stage: 'questions',
          reason: '调试：手动调起问题选择框',
        },
      }
      setList(arr => [...arr, listItem])
    }, 0)
  }, [generateId])

  // ==================== 渲染 ====================

  return (
    <div className="w-full h-full flex flex-col relative">
      {/* 历史记录列表 */}
      <div className="shrink-0">
        {list.map(el => (
          <div key={el.id} className="p-2 border-b border-slate-200">
            <p className="text-sm text-slate-600">{el?.workflow_hint?.reason || el.stage}</p>
            <p className="text-xs text-slate-400">{el?.workflow_hint?.stage}</p>
          </div>
        ))}
      </div>

      {/* 开发调试按钮 */}
      <div className="flex gap-2 p-4 bg-slate-50 border-t border-slate-200 shrink-0">
        <button
          onClick={handleDebugShowInput}
          className="px-4 py-2 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
        >
          调起输入框
        </button>
        <button
          onClick={handleDebugShowQuestions}
          className="px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
        >
          调起问题选择框
        </button>
      </div>

      {/* 澄清问题组件 */}
      <ClarificationWidget
        apiQuestions={apiQuestions}
        apiResponse={apiResponse}
        loading={loading}
        onSend={send}
        hasNeedMoreInfo={needMoreInfo}
        onClearQuestions={clearQuestions}
        isInitialState={isInitialState}
      />
    </div>
  )
}

export default WorkFlow
