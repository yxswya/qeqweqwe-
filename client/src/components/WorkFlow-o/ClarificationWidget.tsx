import { useCallback, useEffect, useMemo, useReducer } from 'react'

// ==================== 类型定义 ====================

interface Option {
  value: string
  label: string
}

export interface ClarificationQuestion {
  id: string
  question: string
  question_type: string
  slot: string
  options: Option[]
}

export interface ApiResponse {
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

interface ClarificationWidgetProps {
  apiQuestions: ClarificationQuestion[]
  apiResponse: ApiResponse | null
  loading: boolean
  onSend: (text: string) => void
  hasNeedMoreInfo: boolean
  onClearQuestions: () => void
  isInitialState: boolean
}

// 面板状态类型
type VisibleState = 'input' | 'questions' | 'hidden'

// ==================== State 管理 ====================

interface PanelState {
  visibleState: VisibleState
  isAnimatingOut: boolean
  textInput: string
  questionAnswers: Record<string, string>
  currentQuestionIndex: number
}

type PanelAction
  = | { type: 'START_CLOSE_ANIMATION' }
    | { type: 'FINISH_CLOSE_ANIMATION' }
    | { type: 'SET_VISIBLE_STATE', state: VisibleState }
    | { type: 'SET_TEXT_INPUT', text: string }
    | { type: 'SET_QUESTION_ANSWER', slot: string, value: string }
    | { type: 'SET_CURRENT_QUESTION_INDEX', index: number }
    | { type: 'RESET_QUESTION_STATE' }
    | { type: 'SYNC_TO_TARGET_STATE', targetState: VisibleState }

const initialPanelState: PanelState = {
  visibleState: 'hidden',
  isAnimatingOut: false,
  textInput: '',
  questionAnswers: {},
  currentQuestionIndex: 0,
}

function panelReducer(state: PanelState, action: PanelAction): PanelState {
  switch (action.type) {
    case 'START_CLOSE_ANIMATION':
      return { ...state, isAnimatingOut: true }

    case 'FINISH_CLOSE_ANIMATION':
      return {
        ...state,
        visibleState: 'hidden',
        isAnimatingOut: false,
      }

    case 'SET_VISIBLE_STATE':
      return { ...state, visibleState: action.state }

    case 'SET_TEXT_INPUT':
      return { ...state, textInput: action.text }

    case 'SET_QUESTION_ANSWER':
      return {
        ...state,
        questionAnswers: { ...state.questionAnswers, [action.slot]: action.value },
      }

    case 'SET_CURRENT_QUESTION_INDEX':
      return { ...state, currentQuestionIndex: action.index }

    case 'RESET_QUESTION_STATE':
      return {
        ...state,
        questionAnswers: {},
        currentQuestionIndex: 0,
      }

    case 'SYNC_TO_TARGET_STATE': {
      const { targetState } = action

      // 如果目标状态与当前状态相同，且不在动画中，不处理
      if (targetState === state.visibleState && !state.isAnimatingOut) {
        return state
      }

      // 如果从可见状态切换到隐藏状态，播放退出动画
      if (
        state.visibleState !== 'hidden'
        && targetState === 'hidden'
        && !state.isAnimatingOut
      ) {
        return { ...state, isAnimatingOut: true }
      }

      // 直接切换到新状态
      if (!state.isAnimatingOut) {
        return { ...state, visibleState: targetState }
      }

      return state
    }

    default:
      return state
  }
}

// ==================== 问题面板子组件 ====================

function QuestionsPanel({
  questions,
  loading,
  onOptionSelect,
  onSubmit,
  currentQuestionIndex,
  setCurrentQuestionIndex,
  questionAnswers,
}: {
  questions: ClarificationQuestion[]
  loading: boolean
  onOptionSelect: (slot: string, value: string) => void
  onSubmit: () => void
  currentQuestionIndex: number
  setCurrentQuestionIndex: (index: number) => void
  questionAnswers: Record<string, string>
}) {
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1
  const allQuestionsAnswered = questions.every(q => questionAnswers[q.slot])

  return (
    <div className="flex flex-col h-[400px]">
      {/* 进度指示器 */}
      <div className="px-6 pt-6 pb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          {questions.map((q, idx) => (
            <div
              key={q.id}
              className={`h-1 flex-1 rounded-full transition-colors duration-200 ${
                idx <= currentQuestionIndex
                  ? 'bg-indigo-600'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
        <p className="text-[12px] text-slate-500 mt-2 text-center">
          {'问题 '}
          {currentQuestionIndex + 1}
          {' / '}
          {questions.length}
        </p>
      </div>

      {/* 问题内容区域 */}
      <div className="flex-1 px-6 py-4 overflow-y-auto">
        {currentQuestion
          ? (
              <div className="h-full flex flex-col">
                <h3 className="text-[16px] font-semibold text-slate-800 mb-5 leading-snug">
                  {currentQuestion.question}
                </h3>

                {/* 选项列表 */}
                <div className="flex-1 space-y-3">
                  {currentQuestion.options.map((opt) => {
                    const isChecked = questionAnswers[currentQuestion.slot] === opt.value
                    return (
                      <label
                        key={opt.value}
                        className={`group relative flex items-center p-4 cursor-pointer border rounded-xl transition-all duration-200 ${
                          isChecked
                            ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500'
                            : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name={currentQuestion.slot}
                          value={opt.value}
                          className="hidden"
                          checked={isChecked}
                          onChange={() => onOptionSelect(currentQuestion.slot, opt.value)}
                        />

                        {/* 自定义 Radio 圆点 */}
                        <div
                          className={`w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center mr-3 transition-colors duration-200 ${
                            isChecked
                              ? 'border-indigo-600 bg-indigo-600'
                              : 'border-slate-300 group-hover:border-indigo-400'
                          }`}
                        >
                          <div
                            className={`w-2 h-2 bg-white rounded-full transition-all duration-200 ${
                              isChecked ? 'opacity-100 scale-100' : 'opacity-0 scale-50'
                            }`}
                          />
                        </div>

                        <span
                          className={`text-[14px] font-medium transition-colors ${
                            isChecked ? 'text-indigo-800' : 'text-slate-700'
                          }`}
                        >
                          {opt.label}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          : (
              <div className="flex items-center justify-center h-full text-slate-400">
                加载中...
              </div>
            )}
      </div>

      {/* 底部控制栏 */}
      <div className="px-6 pb-6 pt-2 flex items-center justify-between flex-shrink-0">
        {/* 上一题按钮 */}
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0 || loading}
          className={`px-4 py-2.5 text-[14px] font-medium rounded-xl transition-all active:scale-[0.98] ${
            currentQuestionIndex === 0 || loading
              ? 'text-slate-400 cursor-not-allowed'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          上一题
        </button>

        {/* 下一题 / 完成按钮 */}
        {!isLastQuestion
          ? (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                disabled={!questionAnswers[currentQuestion?.slot] || loading}
                className={`px-6 py-2.5 text-[14px] font-medium rounded-xl transition-all shadow-md active:scale-[0.98] ${
                  !questionAnswers[currentQuestion?.slot] || loading
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100'
                }`}
              >
                下一题
              </button>
            )
          : (
              <button
                onClick={onSubmit}
                disabled={!allQuestionsAnswered || loading}
                className={`px-6 py-2.5 text-[14px] font-medium rounded-xl transition-all shadow-md active:scale-[0.98] ${
                  !allQuestionsAnswered || loading
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                }`}
              >
                {loading ? '提交中...' : '完成提交'}
              </button>
            )}
      </div>
    </div>
  )
}

// ==================== 主组件 ====================

export default function ClarificationWidget({
  apiQuestions = [],
  loading,
  onSend,
  hasNeedMoreInfo,
  onClearQuestions,
  isInitialState,
}: ClarificationWidgetProps) {
  const [state, dispatch] = useReducer(panelReducer, initialPanelState)

  // 计算目标可见状态（派生状态）
  const targetVisibleState = useMemo((): VisibleState => {
    // 加载中时隐藏面板
    if (loading) {
      return 'hidden'
    }

    // 如果需要更多信息，显示输入框
    if (hasNeedMoreInfo) {
      return 'input'
    }

    // 如果有问题，显示问题面板
    if (apiQuestions.length > 0) {
      return 'questions'
    }

    // 初始状态显示输入框
    if (isInitialState) {
      return 'input'
    }

    return 'hidden'
  }, [loading, hasNeedMoreInfo, apiQuestions.length, isInitialState])

  // 同步目标状态到可见状态
  useEffect(() => {
    dispatch({ type: 'SYNC_TO_TARGET_STATE', targetState: targetVisibleState })
  }, [targetVisibleState])

  // 处理动画结束
  useEffect(() => {
    if (state.isAnimatingOut && targetVisibleState === 'hidden') {
      const timer = setTimeout(() => {
        dispatch({ type: 'FINISH_CLOSE_ANIMATION' })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [state.isAnimatingOut, targetVisibleState])

  // 当问题列表变化时，重置问题相关状态（使用 key 模式）
  const questionsKey = useMemo(
    () => apiQuestions.map(q => q.id).sort().join(','),
    [apiQuestions],
  )

  // 问题列表变化时重置问题状态
  useEffect(() => {
    dispatch({ type: 'RESET_QUESTION_STATE' })
  }, [questionsKey])

  // ==================== 交互处理 ====================

  // 关闭面板（点击遮罩层）
  const handleClose = () => {
    dispatch({ type: 'START_CLOSE_ANIMATION' })
    const timer = setTimeout(() => {
      dispatch({ type: 'FINISH_CLOSE_ANIMATION' })
    }, 300)
    return () => clearTimeout(timer)
  }

  // 阻止点击内容区域时关闭
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // 处理输入框提交
  const handleInputSubmit = () => {
    if (!state.textInput.trim()) {
      return
    }
    onSend(state.textInput)
    dispatch({ type: 'SET_TEXT_INPUT', text: '' })
    onClearQuestions()
  }

  // 处理问题选项选择
  const handleOptionSelect = useCallback((slot: string, value: string) => {
    dispatch({ type: 'SET_QUESTION_ANSWER', slot, value })

    // 自动跳到下一题（如果有）
    const currentIndex = apiQuestions.findIndex(q => q.slot === slot)
    if (currentIndex >= 0 && currentIndex < apiQuestions.length - 1) {
      setTimeout(() => {
        dispatch({ type: 'SET_CURRENT_QUESTION_INDEX', index: currentIndex + 1 })
      }, 200)
    }
  }, [apiQuestions])

  // 处理问题提交
  const handleQuestionsSubmit = () => {
    const answerLabels = Object.values(state.questionAnswers)
    if (answerLabels.length === 0) {
      return
    }
    const answersText = answerLabels.join('，')
    onSend(answersText)
    dispatch({ type: 'RESET_QUESTION_STATE' })
    onClearQuestions()
  }

  // ==================== 渲染 ====================

  // 隐藏状态且不在动画中时不渲染
  if (state.visibleState === 'hidden' && !state.isAnimatingOut) {
    return null
  }

  return (
    <div
      className={`flex justify-center antialiased absolute w-full h-full top-0 left-0 items-end bg-black/80 transition-opacity duration-300 ${
        state.isAnimatingOut ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      {/* 面板容器 */}
      <div
        className={`w-[426px] bg-white rounded-t-2xl shadow-2xl overflow-hidden transition-transform duration-300 ease-out ${
          state.isAnimatingOut ? 'translate-y-full' : 'translate-y-0'
        }`}
        onClick={handleContentClick}
      >
        {/* ========== 输入框面板 ========== */}
        {state.visibleState === 'input' && (
          <div className="flex flex-col h-[400px]">
            {/* 标题栏 */}
            <div className="px-6 pt-6 pb-2 flex-shrink-0">
              <h2 className="text-[18px] font-semibold text-slate-800">
                请详细描述您的需求
              </h2>
              <p className="text-[13px] text-slate-500 mt-1">
                为您提供更精准的服务，请告诉我们更多细节
              </p>
            </div>

            {/* 输入区域 */}
            <div className="flex-1 px-6 py-4">
              <textarea
                value={state.textInput}
                onChange={e => dispatch({ type: 'SET_TEXT_INPUT', text: e.target.value })}
                placeholder="例如：我希望这个系统主要用于公司内部的审批流程，最看重系统上线的时间，其次是成本..."
                className="w-full h-full p-4 text-[14px] leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none placeholder-slate-400"
              />
            </div>

            {/* 提交按钮 */}
            <div className="px-6 pb-6 pt-2 flex-shrink-0">
              <button
                onClick={handleInputSubmit}
                disabled={!state.textInput.trim() || loading}
                className={`w-full py-3 text-[14px] font-medium rounded-xl transition-all shadow-md active:scale-[0.98] ${
                  !state.textInput.trim() || loading
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'
                }`}
              >
                {loading ? '提交中...' : '确认提交'}
              </button>
            </div>
          </div>
        )}

        {/* ========== 问题选择面板 ========== */}
        {state.visibleState === 'questions' && (
          <QuestionsPanel
            key={questionsKey}
            questions={apiQuestions}
            loading={loading}
            onOptionSelect={handleOptionSelect}
            onSubmit={handleQuestionsSubmit}
            currentQuestionIndex={state.currentQuestionIndex}
            setCurrentQuestionIndex={index => dispatch({ type: 'SET_CURRENT_QUESTION_INDEX', index })}
            questionAnswers={state.questionAnswers}
          />
        )}
      </div>
    </div>
  )
}
