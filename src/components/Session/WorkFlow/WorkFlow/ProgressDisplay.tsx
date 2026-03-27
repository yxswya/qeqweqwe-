import type { ApiResponse } from '../../types'

import {
  Brain,
  Check,
  ChevronRight,
  Circle,
  Clock,
  Database,
  FileText,
  Loader2,
  MessageSquare,
  Sparkles,
  Target,
  XCircle,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useStore } from '../../store'
import { hasAnswer, hasIntent, hasModelTrainProgress, hasRagBuildProgress, isRagBuildResponseContent, isModelTrainResponseContent, isLoadingContent, isResponseContent } from '../../types'

export type WorkflowStep = 'pending' | 'running' | 'success' | 'failed'

export interface SubStepItem {
  id: string
  label: string
  status: WorkflowStep
  error?: string
  detail?: string
}

export interface StepItem {
  id: string
  label: string
  status: WorkflowStep
  error?: string
  subSteps?: SubStepItem[]
  icon?: React.ReactNode
  description?: string
  timestamp?: string
}

interface ProgressDisplayProps {
  steps?: StepItem[]
  currentStepIndex?: number
}

// 任务类型图标映射
const TASK_ICONS: Record<string, React.ReactNode> = {
  'agent.create': <Zap size={14} className="text-violet-500" />,
  'agent.update': <Zap size={14} className="text-violet-500" />,
  'workflow.create': <Target size={14} className="text-orange-500" />,
  'workflow.run': <Target size={14} className="text-orange-500" />,
  'rag.index': <Database size={14} className="text-blue-500" />,
  'rag.retrieve': <Database size={14} className="text-blue-500" />,
  'train.start': <Brain size={14} className="text-emerald-500" />,
  'data.clean': <FileText size={14} className="text-amber-500" />,
  'data.import': <FileText size={14} className="text-amber-500" />,
  'intent': <Target size={14} className="text-indigo-500" />,
  'rag-build': <Database size={14} className="text-blue-500" />,
  'model-train': <Brain size={14} className="text-emerald-500" />,
  'model-registered': <Brain size={14} className="text-emerald-500" />,
  'answer': <Sparkles size={14} className="text-pink-500" />,
}

// 意图映射表
const INTENT_LABELS: Record<string, string> = {
  'agent.create': '创建智能体',
  'agent.update': '更新智能体',
  'workflow.create': '创建工作流',
  'workflow.run': '运行工作流',
  'rag.index': '构建知识库',
  'rag.retrieve': '查询知识库',
  'train.start': '启动模型训练',
  'data.clean': '数据清洗',
  'data.import': '数据导入',
}

// 任务卡片组件
interface TaskCardProps {
  task: StepItem
  isExpanded: boolean
  onToggle: () => void
  isLatest?: boolean
}

function TaskCard({ task, isExpanded, onToggle, isLatest }: TaskCardProps) {
  const hasSubSteps = task.subSteps && task.subSteps.length > 0

  // 获取状态样式
  const getStatusStyles = (status: WorkflowStep) => {
    switch (status) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          badge: 'bg-emerald-100 text-emerald-700',
          icon: <Check size={12} className="text-emerald-500" />,
          text: '已完成',
        }
      case 'running':
        return {
          bg: 'bg-blue-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
          icon: <Loader2 size={12} className="text-blue-500 animate-spin" />,
          text: '进行中',
        }
      case 'failed':
        return {
          bg: 'bg-red-50 border-red-200',
          badge: 'bg-red-100 text-red-700',
          icon: <XCircle size={12} className="text-red-500" />,
          text: '失败',
        }
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          badge: 'bg-gray-100 text-gray-600',
          icon: <Circle size={12} className="text-gray-400" />,
          text: '等待中',
        }
    }
  }

  const styles = getStatusStyles(task.status)

  return (
    <div
      className={`
        relative rounded-lg border transition-all duration-200
        ${styles.bg}
        ${isLatest && task.status === 'running' ? 'ring-2 ring-blue-200 ring-offset-1' : ''}
      `}
    >
      {/* 任务头部 */}
      <div
        className={`flex items-center gap-3 p-3 ${hasSubSteps ? 'cursor-pointer hover:bg-white/50' : ''}`}
        onClick={hasSubSteps ? onToggle : undefined}
      >
        {/* 任务图标 */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
          {TASK_ICONS[task.id.split('-')[0]] || <MessageSquare size={14} className="text-gray-400" />}
        </div>

        {/* 任务信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800 truncate">{task.label}</span>
            {isLatest && task.status === 'running' && (
              <span className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded animate-pulse">
                最新
              </span>
            )}
          </div>
          {task.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{task.description}</p>
          )}
        </div>

        {/* 状态和时间 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {task.timestamp && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={10} />
              {task.timestamp}
            </span>
          )}
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${styles.badge}`}>
            {styles.icon}
            <span className="text-xs">{styles.text}</span>
          </div>
          {hasSubSteps && (
            <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}>
              <ChevronRight size={14} className="text-gray-400" />
            </div>
          )}
        </div>
      </div>

      {/* 子步骤详情 */}
      {hasSubSteps && isExpanded && (
        <div className="px-3 pb-3 pt-0">
          <div className="ml-11 space-y-1.5 border-l-2 border-gray-200 pl-3">
            {task.subSteps!.map((subStep) => {
              const subStyles = getStatusStyles(subStep.status)
              return (
                <div key={subStep.id} className="flex items-center gap-2 py-1">
                  <div className={`flex-shrink-0 ${subStyles.badge} rounded-full p-0.5`}>
                    {subStyles.icon}
                  </div>
                  <span className="text-xs text-gray-600 flex-1">{subStep.label}</span>
                  {subStep.detail && (
                    <span className="text-xs text-gray-400">{subStep.detail}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// 从消息中构建任务列表
function buildTaskList(messages: any[]): StepItem[] {
  const tasks: StepItem[] = []

  for (const msg of messages) {
    const msgContent = msg.content
    if (!msgContent || typeof msgContent !== 'object')
      continue

    const timestamp = msg.createdAt
      ? new Date(msg.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      : undefined

    // 处理 loading 状态消息
    if (isLoadingContent(msgContent)) {
      const statusMap: Record<string, { label: string, icon: string }> = {
        rag_build_pending: { label: '知识库构建', icon: 'rag-build' },
        model_train_pending: { label: '模型训练准备', icon: 'model-train' },
        model_train_train_start: { label: '模型训练中', icon: 'model-train' },
        model_train_train_complete: { label: '模型训练完成', icon: 'model-train' },
        model_train_register_start: { label: '模型注册中', icon: 'model-registered' },
        model_train_register_complete: { label: '模型注册完成', icon: 'model-registered' },
      }

      const statusInfo = statusMap[msgContent.status]
      if (statusInfo) {
        tasks.push({
          id: `loading-${msg.id}`,
          label: statusInfo.label,
          status: 'running',
          icon: TASK_ICONS[statusInfo.icon],
          timestamp,
        })
      }
      continue
    }

    // 处理 RAG 构建响应
    if (isRagBuildResponseContent(msgContent)) {
      tasks.push({
        id: `rag-${msg.id}`,
        label: 'RAG 知识库构建',
        status: 'success',
        icon: TASK_ICONS['rag-build'],
        description: msgContent.data?.answer?.rag?.run_id || '构建完成',
        timestamp,
        subSteps: [
          { id: 'rag-chunk', label: '文档分块完成', status: 'success' },
          { id: 'rag-embed', label: '向量嵌入完成', status: 'success' },
          { id: 'rag-index', label: '索引构建完成', status: 'success' },
        ],
      })
      continue
    }

    // 处理模型训练响应
    if (isModelTrainResponseContent(msgContent)) {
      const registerData = msgContent.data?.register

      tasks.push({
        id: `train-${msg.id}`,
        label: '模型训练',
        status: 'success',
        icon: TASK_ICONS['model-train'],
        description: registerData?.answer?.model_uri || '训练完成',
        timestamp,
        subSteps: [
          { id: 'init', label: '加载配置', status: 'success' },
          { id: 'train', label: '模型训练完成', status: 'success' },
          { id: 'register', label: '模型注册完成', status: 'success' },
        ],
      })
      continue
    }

    // 处理普通响应
    if (isResponseContent(msgContent)) {
      const responseData = msgContent.data as ApiResponse

      // 意图识别
      if (hasIntent(responseData)) {
        const intentValue = responseData.intent.intent
        const intentLabel = INTENT_LABELS[intentValue] || intentValue

        tasks.push({
          id: `intent-${msg.id}`,
          label: '意图识别',
          status: 'success',
          icon: TASK_ICONS['intent'],
          description: intentLabel,
          timestamp,
          subSteps: [
            {
              id: `${msg.id}-domain`,
              label: `业务域: ${responseData.intent.domain}`,
              status: 'success',
            },
            {
              id: `${msg.id}-sub`,
              label: `子意图: ${responseData.intent.sub_intent}`,
              status: 'success',
            },
            {
              id: `${msg.id}-stage`,
              label: `流程阶段: ${responseData.workflow_hint.stage}`,
              status: 'success',
            },
          ],
        })
      }

      // RAG 构建进度（旧格式）
      if (hasRagBuildProgress(responseData)) {
        tasks.push({
          id: `rag-old-${msg.id}`,
          label: 'RAG 知识库构建',
          status: responseData.status === 'success' ? 'success' : 'running',
          icon: TASK_ICONS['rag-build'],
          description: responseData.title,
          timestamp,
          subSteps: responseData.status === 'success'
            ? [
                { id: 'rag-chunk', label: '文档分块完成', status: 'success' },
                { id: 'rag-embed', label: '向量嵌入完成', status: 'success' },
                { id: 'rag-index', label: '索引构建完成', status: 'success' },
              ]
            : [
                { id: 'rag-chunk', label: '文档分块中...', status: 'running' },
                { id: 'rag-embed', label: '等待向量嵌入', status: 'pending' },
                { id: 'rag-index', label: '等待索引构建', status: 'pending' },
              ],
        })
      }

      // 模型训练进度（旧格式）
      if (hasModelTrainProgress(responseData)) {
        const stageLabels: Record<number, string> = {
          1: '初始化中',
          2: '训练中',
          3: '训练完成',
          4: '注册中',
          5: '已注册',
        }

        const trainStage = responseData.trainStage || 1
        const subSteps: SubStepItem[] = []

        if (trainStage >= 1) {
          subSteps.push({ id: 'init', label: '加载配置', status: trainStage > 1 ? 'success' : 'running' })
        }
        if (trainStage >= 2) {
          subSteps.push({
            id: 'train',
            label: `模型训练 ${responseData.currentEpoch || 0}/${responseData.totalEpochs || 0}`,
            status: trainStage > 2 ? 'success' : 'running',
          })
        }
        if (trainStage >= 3) {
          subSteps.push({ id: 'complete', label: '训练完成', status: 'success', detail: responseData.outputSize })
        }
        if (trainStage >= 4) {
          subSteps.push({ id: 'register', label: '模型注册', status: trainStage > 4 ? 'success' : 'running' })
        }
        if (trainStage >= 5) {
          subSteps.push({ id: 'endpoint', label: `推理端点: ${responseData.inferEndpoint || '-'}`, status: 'success' })
        }

        tasks.push({
          id: `train-old-${msg.id}`,
          label: '模型训练',
          status: responseData.status === 'success' ? 'success' : 'running',
          icon: TASK_ICONS['model-train'],
          description: `${responseData.title} - ${stageLabels[trainStage]}`,
          timestamp,
          subSteps,
        })
      }

      // 完整响应
      if (hasAnswer(responseData) && responseData.answer.normalized_request?.ai_summary) {
        tasks.push({
          id: `answer-${msg.id}`,
          label: '任务响应',
          status: 'success',
          icon: TASK_ICONS['answer'],
          description: responseData.answer.normalized_request.ai_summary,
          timestamp,
        })
      }
    }
  }

  return tasks
}

const ProgressDisplay: React.FC<ProgressDisplayProps> = ({ steps: propSteps }) => {
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(() => new Set())
  const messages = useStore(state => state.messages)

  // 从消息中构建任务列表
  const tasks = useMemo(() => {
    if (propSteps && propSteps.length > 0) {
      return propSteps
    }
    return buildTaskList(messages)
  }, [propSteps, messages])

  const toggleTask = (taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      }
      else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  // 统计信息
  const stats = useMemo(() => {
    const running = tasks.filter(t => t.status === 'running').length
    const success = tasks.filter(t => t.status === 'success').length
    const failed = tasks.filter(t => t.status === 'failed').length
    return { total: tasks.length, running, success, failed }
  }, [tasks])

  // 空状态
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
          <MessageSquare size={20} className="text-gray-400" />
        </div>
        <p className="text-sm text-gray-500 text-center">暂无任务记录</p>
        <p className="text-xs text-gray-400 text-center mt-1">开始对话后将显示任务进度</p>
      </div>
    )
  }

  return (
    <div className="w-full py-2">
      {/* 标题和统计 */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={16} className="text-blue-500" />
            <span className="text-sm font-medium">任务历史</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {stats.running > 0 && (
              <span className="flex items-center gap-1 text-blue-600">
                <Loader2 size={10} className="animate-spin" />
                {stats.running}
                {' '}
                进行中
              </span>
            )}
            {stats.success > 0 && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Check size={10} />
                {stats.success}
                {' '}
                完成
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 任务列表 - 时间线样式 */}
      <div className="px-4 space-y-3 max-h-[400px] overflow-y-auto">
        {tasks.map((task, index) => (
          <TaskCard
            key={task.id}
            task={task}
            isExpanded={expandedTasks.has(task.id)}
            onToggle={() => toggleTask(task.id)}
            isLatest={index === tasks.length - 1}
          />
        ))}
      </div>

      {/* 底部统计 */}
      {tasks.length > 0 && (
        <div className="mt-4 mx-4 px-3 py-2 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              共
              {stats.total}
              {' '}
              条任务记录
            </span>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                进行中:
                {stats.running}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                完成:
                {stats.success}
              </span>
              {stats.failed > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  失败:
                  {stats.failed}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProgressDisplay
