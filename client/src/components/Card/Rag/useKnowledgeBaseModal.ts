import type {
  LogEntry,
  UploadFile,
  UploadStage,
} from './types.ts'
import type { RagBuildResponse } from '@/api/modules/rag'
import type { Message } from '@/components/Chat/index.ts'
import * as React from 'react'
import { ragApi } from '@/api/modules/rag'
import { transform } from '@/components/Chat/utils/transform.ts'
import {
  DEFAULT_ESTIMATED_TIME,
  DEFAULT_RAG_CONFIG,
} from './constants.ts'

export interface UseKnowledgeBaseModalProps {
  sessionId: string | undefined
  addAssistantMessage: (content: string, genre?: Message['genre']) => void
  files: UploadFile[]
  setFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>
  clearFiles: () => void
}

export interface UseKnowledgeBaseModalReturn {
  showModal: boolean
  currentStage: UploadStage
  parseProgress: number
  estimatedTime: number
  logs: LogEntry[]
  knowledgeBaseEnabled: boolean
  handleEnableKnowledgeBase: () => void
  handleCancel: () => void
  handleStartParse: () => Promise<void>
  handleComplete: () => void
  addLog: (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error',
  ) => void
}

/**
 * 知识库模态框状态管理 Hook
 */
export function useKnowledgeBaseModal({
  sessionId,
  addAssistantMessage,
  files,
  setFiles,
  clearFiles,
}: UseKnowledgeBaseModalProps): UseKnowledgeBaseModalReturn {
  const [showModal, setShowModal] = React.useState(false)
  const [currentStage, setCurrentStage] = React.useState<UploadStage>('upload')
  const [parseProgress, setParseProgress] = React.useState(0)
  const [estimatedTime, setEstimatedTime] = React.useState(DEFAULT_ESTIMATED_TIME)
  const [logs, setLogs] = React.useState<LogEntry[]>([])
  const [knowledgeBaseEnabled, setKnowledgeBaseEnabled] = React.useState(false)

  const handleEnableKnowledgeBase = () => {
    setShowModal(true)
  }

  const handleCancel = () => {
    clearFiles()
    setCurrentStage('upload')
    setParseProgress(0)
    setEstimatedTime(DEFAULT_ESTIMATED_TIME)
    setShowModal(false)
  }

  const handleStartParse = async () => {
    // 检查是否有文件且都上传完成
    const hasFiles = files.length > 0
    const allUploaded = files.every(f => f.status === 'success')

    if (!hasFiles || !allUploaded) {
      return
    }

    // 切换到解析阶段
    setCurrentStage('parse')

    // 初始化文件的解析状态
    setFiles(prev =>
      prev.map(f => ({
        ...f,
        parseStatus: 'pending',
        parseProgress: 0,
      })),
    )

    // 清空旧日志
    setLogs([])

    // 调用 API 接口
    try {
      addLog('开始知识库解析...', 'info')

      const formData = new FormData()
      formData.append(
        'title',
        `知识库构建 - ${new Date().toLocaleString()}`,
      )
      if (sessionId) {
        formData.append('session_id', sessionId)
      }

      // 添加 RAG 配置
      formData.append('rag_cfg', JSON.stringify(DEFAULT_RAG_CONFIG))

      // 添加文件
      files.forEach((f) => {
        formData.append('dataset_files', f.file)
      })

      // 添加文件元数据
      const fileMetas = files.map(f => ({
        name: f.file.name,
        description: '知识库文档',
        task_type: 'rag',
      }))
      formData.append('dataset_file_metas', JSON.stringify(fileMetas))

      // 调用 API
      const response = await ragApi.build_with_governance(formData)

      // console.log((response.data))
      // addMessage(response.data)
      addAssistantMessage(
        response.data.content,
      )

      if (response.code === 0) {
        addLog('知识库构建任务已提交', 'success')
        // 标记所有文件解析完成
        setFiles(prev =>
          prev.map(f => ({
            ...f,
            parseStatus: 'completed',
            parseProgress: 100,
          })),
        )
        setParseProgress(100)
        setEstimatedTime(0)
      }
      else {
        addLog(`知识库构建失败: ${response.message}`, 'error')
        // 标记失败
        setFiles(prev =>
          prev.map(f => ({
            ...f,
            parseStatus: 'failed',
            parseProgress: 0,
          })),
        )
      }
    }
    catch (error) {
      addLog(
        `知识库构建失败: ${error instanceof Error ? error.message : '未知错误'}`,
        'error',
      )
      setFiles(prev =>
        prev.map(f => ({
          ...f,
          parseStatus: 'failed',
          parseProgress: 0,
        })),
      )
    }
  }

  const handleComplete = () => {
    setKnowledgeBaseEnabled(true)
    setShowModal(false)
    clearFiles()
    setCurrentStage('upload')
    setParseProgress(0)
    setEstimatedTime(DEFAULT_ESTIMATED_TIME)
  }

  const addLog = (
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info',
  ) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      type,
      message,
    }
    setLogs(prev => [...prev, newLog])
  }

  return {
    showModal,
    currentStage,
    parseProgress,
    estimatedTime,
    logs,
    knowledgeBaseEnabled,
    handleEnableKnowledgeBase,
    handleCancel,
    handleStartParse,
    handleComplete,
    addLog,
  }
}
