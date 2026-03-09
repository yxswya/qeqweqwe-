import type { ChatResponse } from '@/api/modules'

export type MessageRaw = ChatResponse

export const MessageTypes = {
  /**
   * 用户 & 机器人：透明类型，会出现在消息列表中，但是不会展示任何视图
   */
  Transparent: 'TRANSPARENT',

  /**
   * 用户：纯文本信息
   */
  UserText: 'USER_TEXT',

  /**
   * 机器人：纯文本信息
   */
  AssistantText: 'ASSISTANT_TEXT',

  /**
   * 机器人：执行动作映射 —— RAG 构建索引
   */
  AssistantRagBuildIndex: 'RAG_BUILD_INDEX',

  /**
   * 机器人：执行动作映射 —— 追问更多信息
   */
  AssistantAskMoreInfo: 'ASK_MORE_INFO',

  /**
   * 机器人：执行动作映射 —— 智能体创建
   */
  AssistantAgentCreate: 'AGENT_CREATE',
} as const

export type MessageType = (typeof MessageTypes)[keyof typeof MessageTypes]

export interface Message {
  id: string
  raw: MessageRaw
  loading?: boolean
  type: MessageType
}

export interface RagBuildParams {
  rag_cfg: {
    backend: 'milvus' | 'pgvector' | 'file' // 向量存储后端：milvus、pgvector 或 file（本地文件）
    embedder: string // 向量化模型，如 sentence-transformers/all-MiniLM-L6-v2 或 BAAI/bge-large-zh-v1.5
    device?: string // 运行设备：cpu 或 cuda:0
    batch_size?: number // 批处理大小，默认 32
    dim?: number // 向量维度，如 384（MiniLM）、1024（bge-large）
    metric?: string // 相似度计算方式：cosine、ip（内积）、l2
    table?: string // PostgreSQL 表名（仅 pgvector 用）
    chunk?: { // 分块配置
      size: number // size（块大小）
      overlap: number // overlap（重叠）
      max_chunks: number // max_chunks（最大块数）
    }
  }
  dataset_ids: string[] // 数据集路径列表，支持目录或文件（.txt/.md/.csv/.log/.pdf/.docx）
  clean_id?: string // 可选的清洗任务 ID
}
