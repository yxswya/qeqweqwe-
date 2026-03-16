import type { Success } from '@/api'
import { http } from '@/api'

/** 文档分块配置 */
export interface ChunkConfig {
  /** 分块大小（字符数） */
  size: number
  /** 分块重叠字符数 */
  overlap: number
}

/** RAG 配置 */
export interface RAGConfig {
  /** 向量数据库后端（如 pgvector、milvus） */
  backend: string
  /** 嵌入模型名称（如 sentence-transformers/all-MiniLM-L6-v2） */
  embedder: string
  /** 向量维度 */
  dim: number
  /** 相似度计算方式（如 cosine、l2、ip） */
  metric: string
  /** 文档分块配置 */
  chunk: ChunkConfig
}

/** RAG 输入参数 */
export interface RAGInputs {
  /** RAG 配置 */
  rag_cfg: RAGConfig
  /** 数据集 ID 列表 */
  dataset_ids: string[]
  /** 清洗任务 ID */
  clean_id: string | null
}

/** RAG 制品信息 */
export interface RAGArtifacts {
  /** 索引版本 */
  index_version: string
  /** 索引 URI */
  index_uri: string
  /** 清单文件 URI */
  manifest_uri: string
  /** 嵌入模型 */
  embedder: string
  /** 相似度度量 */
  metric: string
  /** 向量维度 */
  dim: number
}

/** 数据集摘要统计 */
export interface DatasetSummary {
  /** 总数 */
  total: number
  /** 字节数 */
  bytes: number
  /** 来源文件列表 */
  sources: string[]
  /** 回退列表 */
  fallback: unknown[]
  /** 错误列表 */
  errors: unknown[]
}

/** 分块分布统计 */
export interface ChunkDistribution {
  /** 最小分块大小 */
  min: number
  /** 最大分块大小 */
  max: number
  /** 平均分块大小 */
  avg: number
  /** 分块数量 */
  count: number
}

/** RAG 统计信息 */
export interface RAGStats {
  /** 数据集摘要 */
  dataset_summary: DatasetSummary
  /** 分块分布 */
  chunk_distribution: ChunkDistribution
  /** 嵌入维度 */
  embedding_dim: number
  /** 嵌入模型 */
  embedding_model: string
}

/** RAG 构建结果 */
export interface RAGBuildResult {
  /** 运行 ID */
  run_id: string
  /** 阶段 */
  stage: string
  /** 是否使用缓存 */
  cached: boolean
  /** 输入参数 */
  inputs: RAGInputs
  /** 制品信息 */
  artifacts: RAGArtifacts
  /** 耗时（毫秒） */
  elapsed_ms: number
  /** 统计信息 */
  stats: RAGStats
  /** 警告列表 */
  warnings: unknown[]
}

/** 数据治理报告 */
export interface GovernanceReports {
  /** 摄入报告 */
  ingest: Record<string, unknown>
  /** 清洗报告 */
  cleaning: Record<string, unknown>
  /** 合规报告 */
  compliance: Record<string, unknown>
  /** 评估报告 */
  valuation: Record<string, unknown>
}

/** 数据治理摘要 */
export interface GovernanceSummary {
  /** 文件名称 */
  name: string
  /** 任务类型 */
  task_type: string
  /** 风险等级 */
  risk_level: string | null
  /** 质量分数 */
  quality_score: number | null
  /** PII（个人身份信息）数量 */
  pii_count: number
}

/** 数据治理存储信息 */
export interface GovernanceStorage {
  /** 原始文件目录 */
  raw_dir: string
  /** 清洗后文件目录 */
  cleaned_dir: string
  /** 质量报告路径 */
  quality_report: string
  /** 清单文件路径 */
  manifest: string
  /** 样本文件路径 */
  samples_file: string
  /** 标准样本文件路径 */
  standard_samples_file: string
}

/** 数据治理结果 */
export interface GovernanceResult {
  /** 数据集 ID */
  dataset_id: string
  /** 清洗后的数据集路径 */
  cleaned_dataset_path: string
  /** 清洗后目录 */
  cleaned_dir: string
  /** 报告信息 */
  reports: GovernanceReports
  /** 摘要信息 */
  summary: GovernanceSummary
  /** 存储信息 */
  storage: GovernanceStorage
}

/** 数据治理和 RAG 构建结果 */
export interface RagBuildAnswer {
  /** 数据治理结果列表 */
  governance: GovernanceResult[]
  /** RAG 构建结果 */
  rag: RAGBuildResult
}

/** 元数据信息 */
export interface RagBuildMetaData {
  /** 构建结果 */
  answer: RagBuildAnswer
  /** 置信度 */
  confidence: number
  /** 数据源列表 */
  sources: string[]
  /** 错误信息 */
  error: string | null
  /** 耗时（秒） */
  cost_seconds: string
}

/** RAG 构建响应 */
export interface RagBuildResponse {
  /** 任务 ID */
  task_id: number
  /** 任务标题 */
  title: string
  /** 内容描述 */
  content: string
  /** 用户 ID */
  user_id: string
  /** 状态 */
  status: string
  /** 元数据 */
  meta_data: RagBuildMetaData
  /** 索引版本 */
  index_version: string
  /** 创建时间 */
  created_at: string
  /** 更新时间 */
  updated_at: string
}

export const ragApi = {
  /**
   * RAG 构建以及数据治理
   * @param data FormData 包含文件和配置信息
   * @returns RAG 构建响应
   */
  build_with_governance: (data: FormData) =>
    http.post<Success<RagBuildResponse>>('/exec/rag/build_with_governance', data),
}
