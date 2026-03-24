// RAG 配置类型
export interface RagConfig {
  backend: 'pgvector' | 'milvus'
  embedder: string
  dim: number
  metric: 'cosine' | 'l2' | 'ip'
  chunk: {
    size: number
    overlap: number
  }
}

// 训练配置类型
export interface TrainConfig {
  method: 'lora' | 'qlora' | 'full'
  base_model: string
  epochs: number
  batch_size: number
  max_seq_len: number
}

// 默认 RAG 配置
export const defaultRagConfig: RagConfig = {
  backend: 'milvus',
  embedder: 'sentence-transformers/all-MiniLM-L6-v2',
  dim: 384,
  metric: 'cosine',
  chunk: {
    size: 800,
    overlap: 120,
  },
}

// 默认训练配置
export const defaultTrainConfig: TrainConfig = {
  method: 'lora',
  base_model: 'facebook/opt-125m',
  epochs: 1,
  batch_size: 1,
  max_seq_len: 256,
}

// 可选的 embedder 模型
export const embedderOptions = [
  { value: 'sentence-transformers/all-MiniLM-L6-v2', label: 'all-MiniLM-L6-v2 (384 dim)' },
  { value: 'sentence-transformers/all-mpnet-base-v2', label: 'all-mpnet-base-v2 (768 dim)' },
  { value: 'BAAI/bge-small-en-v1.5', label: 'bge-small-en-v1.5 (384 dim)' },
  { value: 'BAAI/bge-base-en-v1.5', label: 'bge-base-en-v1.5 (768 dim)' },
] as const

// 可选的基础模型
export const baseModelOptions = [
  { value: 'facebook/opt-125m', label: 'OPT-125M (轻量级)' },
  { value: 'facebook/opt-350m', label: 'OPT-350M (小型)' },
  { value: 'facebook/opt-1.3b', label: 'OPT-1.3B (中型)' },
] as const
