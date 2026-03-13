import type { Message } from '@/components/Chat/index.ts'

export interface Raw {
  content: string
}

export interface UploadFile {
  id: string
  file: File
  status: 'uploading' | 'success' | 'error'
  progress: number
  parseStatus?: 'pending' | 'parsing' | 'completed' | 'failed'
  parseProgress?: number
}

export type UploadStage = 'upload' | 'parse'

export interface LogEntry {
  id: string
  timestamp: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

export interface RagComponentProps {
  message: Message
}

export interface KnowledgeBaseSectionProps {
  message: Message
  knowledgeBaseEnabled: boolean
  onEnableKnowledgeBase: () => void
}

export interface RecommendedPlanProps {
  message: Message
}

export interface FileUploadModalProps {
  files: UploadFile[]
  dragOver: boolean
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent) => void
  onUploadClick: () => void
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void
  uploadAreaRef: React.RefObject<HTMLDivElement | null>
  fileInputRef: React.RefObject<HTMLInputElement | null>
  onCancel: () => void
  onStartParse: () => void
}

export interface FileParsingModalProps {
  files: UploadFile[]
  parseProgress: number
  estimatedTime: number
  logs: LogEntry[]
  logContainerRef: React.RefObject<HTMLDivElement | null>
  onComplete: () => void
}

export interface FileListItemProps {
  file: UploadFile
  mode: 'upload' | 'parse'
}

export interface TerminalLogProps {
  logs: LogEntry[]
  logContainerRef: React.RefObject<HTMLDivElement | null>
}

export interface RAGConfig {
  backend: string
  embedder: string
  dim: number
  metric: string
  chunk: {
    size: number
    overlap: number
  }
}

export interface RagBuildResponse {
  code: number
  message?: string
  data: Message
}

// 模拟 API 调用函数类型
export type RagBuildApiFunction = (formData: FormData) => Promise<RagBuildResponse>
