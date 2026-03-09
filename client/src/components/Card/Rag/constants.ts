import type { RAGConfig } from './types.ts'

/**
 * RAG 配置常量
 */
export const DEFAULT_RAG_CONFIG: RAGConfig = {
  backend: 'pgvector',
  embedder: 'sentence-transformers/all-MiniLM-L6-v2',
  dim: 384,
  metric: 'cosine',
  chunk: {
    size: 512,
    overlap: 64,
  },
}

/**
 * 支持的文件类型
 */
export const ACCEPTED_FILE_TYPES = '.csv,.json,.txt,.pdf,.doc,.docx'

/**
 * 最大文件大小（50MB）
 */
export const MAX_FILE_SIZE = 50 * 1024 * 1024

/**
 * 上传进度更新间隔（毫秒）
 */
export const UPLOAD_PROGRESS_INTERVAL = 300

/**
 * 默认预计解析时间（秒）
 */
export const DEFAULT_ESTIMATED_TIME = 8

/**
 * 知识库适用场景列表
 */
export const KNOWLEDGE_BASE_USE_CASES = [
  '企业内部规则',
  '产品 / 服务说明',
  'FAQ、文档类资料',
] as const

/**
 * 预期效果提升范围
 */
export const EXPECTED_IMPROVEMENT = {
  min: 15,
  max: 30,
} as const

/**
 * 终端日志颜色映射
 */
export const LOG_LEVEL_COLORS = {
  info: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
} as const
