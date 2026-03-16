import type { Success } from '@/api/modules/auth'
import { http } from '@/api'

export interface BaseChatResponse {
  id: string
  role: 'user' | 'assistant'
  session_id: string
  is_safe?: boolean
  created_at: string
  content: string
  meta_data: unknown
  result_data: unknown
  loading?: boolean
}

export interface ClarificationQuestions {
  id: string
  question: string
  question_type: 'completeness'
  slot: string
  options: Array<{
    label: string
    value: string
  }>
}

/** 意图识别未完成的消息卡片（需要用户补充信息） */
export interface CompletenessCardMessage extends BaseChatResponse {
  id: string
  role: 'user' | 'assistant'
  session_id: string
  is_safe: boolean
  created_at: string
  content: string
  loading?: boolean
  meta_data: {
    /** 当前阶段：completeness 表示完整性检查阶段 */
    stage: 'completeness'
    /** 会话标识 */
    session_id: string
    /** 下一步操作（如 request_clarification 请求澄清、proceed 继续） */
    next_action: string
    /** 处理耗时（秒） */
    cost_seconds: string
    /** 完整性检查响应结果 */
    answer: {
      /** 澄清问题列表（用于向用户追问缺失信息） */
      clarification_questions: ClarificationQuestions[]
      /** 完整性检查是否通过 */
      completeness_passed: boolean
      /** 已识别的信息键值对（如 {"data_type": "文本", "language": "中文"}） */
      identified_info: Record<string, string>
      /** 信息是否已完整 */
      is_completed: boolean
      /** 缺失的字段列表（槽位名称，如 ["data_type", "use_scenario"]） */
      missing_slots: string[]
      /** 下一步操作 */
      next_action: string
      /** 规范化后的用户请求（结构化提取） */
      normalized_request: {
        /** AI 对用户请求的自然语言摘要 */
        ai_summary: string
        /** 数据类型（如 "文本数据"、"图像数据"、"结构化数据"） */
        data_type: string | null
        /** 领域语言（如 "Python"、"SQL"、"自然语言"） */
        domain_language: string | null
        /** 性能目标（如 "高并发"、"低延迟"、"高精度"） */
        performance_target: string | null
        /** 优先级（如 "高"、"中"、"低"） */
        priority: string | null
        /** 使用场景（如 "智能问答"、"文档检索"、"语义搜索"） */
        use_scenario: string | null
      }
      /** 对话轮次 */
      round: number
      /** 会话标识 */
      session_id: string
      /** 阶段标识：completeness 表示完整性检查阶段 */
      stage: 'completeness'
    }
  }
  /** 执行结果数据（此阶段为 null） */
  result_data: null
}

/** 意图识别已完成的消息卡片 */
export interface IntentCardMessage extends BaseChatResponse {
  id: string
  role: 'user' | 'assistant'
  session_id: string
  is_safe: boolean
  created_at: string
  content: string
  loading?: boolean
  meta_data: {
    /** 完整性检查结果 */
    completeness: {
      /** 澄清问题列表（用于信息不完整时追问） */
      clarification_questions: ClarificationQuestions[]
      /** 完整性检查是否通过 */
      completeness_passed: boolean
      /** 已识别的信息键值对（如 {"data_type": "文本", "language": "中文"}） */
      identified_info: Record<string, string>
      /** 信息是否完整 */
      is_complete: boolean
      /** 缺失的字段列表（槽位名称） */
      missing_slots: string[]
      /** 下一步操作（如 "proceed" 继续、"request_clarification" 请求澄清） */
      next_action: string
      /** 规范化后的用户请求（结构化提取） */
      normalized_request: {
        /** AI 对用户请求的自然语言摘要 */
        ai_summary: string
        /** 数据类型（如 "文本数据"、"图像数据"、"结构化数据"） */
        data_type: string | null
        /** 领域语言（如 "Python"、"SQL"、"自然语言"） */
        domain_language: string | null
        /** 性能目标（如 "高并发"、"低延迟"、"高精度"） */
        performance_target: string | null
        /** 优先级（如 "高"、"中"、"低"） */
        priority: string | null
        /** 使用场景（如 "智能问答"、"文档检索"、"语义搜索"） */
        use_scenario: string | null
      }
      /** 对话轮次 */
      round: number
      /** 会话标识 */
      session_id: string
      /** 阶段标识：completeness 表示完整性检查阶段 */
      stage: 'completeness'
    }
    /** 意图识别结果 */
    intent: {
      /** 执行动作映射（步骤编号 -> 动作类型，如 RAG_BUILD_INDEX 建索引 ASK_MORE_INFO 追问更多需求） */
      actions: Record<number, 'RAG_BUILD_INDEX' | 'ASK_MORE_INFO' | 'AGENT_CREATE'>
      /** 生成的制品映射（步骤编号 -> 制品类型） */
      artifacts: Record<number, 'vector_index' | 'report' | 'agent_app'>
      /** 计算资源估算 */
      compute_estimate: {
        /** 估算置信度（0-1） */
        confidence: number
        /** 成本敏感度（low/medium/high） */
        cost_sensitivity: 'low' | 'medium' | 'high'
        /** 需要的 CPU 核心数 */
        cpu_cores: number
        /** 预估耗时（小时） */
        estimated_hours: number
        /** 需要的 GPU 数量 */
        gpu_count: number
        /** 需要的 GPU 显存（GB） */
        gpu_memory_gb: number
        /** 推荐的 GPU 型号 */
        gpu_type: string
        /** 需要的内存（GB） */
        ram_gb: number
        /** 估算依据说明 */
        rationale: string
        /** 工作负载级别（light/medium/heavy） */
        workload_level: string
      }
      /** 意图识别置信度（0-1） */
      confidence: number
      /** 约束条件列表 */
      constraints: unknown[]
      /** 领域标识（如 rag、train、inference） */
      domain: 'rag' | 'train' | 'inference'
      /** 额外信息（扩展字段） */
      extras: unknown
      /** 幂等性标识（用于防止重复执行） */
      idempotency_key: string
      /** 识别出的意图描述（如 "构建 RAG 知识库索引"） */
      intent: 'rag' | 'other.unknown'
      /** 任务优先级（high/medium/low/normal） */
      priority: string
      /** 意图识别的理由/依据 */
      rationale: string
      /** 提取的信息槽位（用户需求的结构化表示） */
      slots: {
        /** AI 对用户需求的理解摘要 */
        ai_summary: string
        /** 数据类型 */
        data_type: string | null
        /** 编程语言或领域语言 */
        domain_language: string | null
        /** 性能指标要求 */
        performance_target: string | null
        /** 任务优先级 */
        priority: string | null
        /** 具体应用场景 */
        use_scenario: string | null
      }
      /** 子意图（更细粒度的意图分类） */
      sub_intent: string
      /** 意图摘要（简短描述） */
      summary: string
      /** 任务类型（如 RAG_BUILD_INDEX、MODEL_TRAINING, other） */
      task_type: string
      /** 追踪 ID（用于日志关联和调试） */
      trace_id: string
      /** 工作流提示/引导 */
      workflow_hint: {
        /** 工作流阶段（continue 继续、stop 停止、wait 等待） */
        stage: 'continue' | 'need_more_info'
        /** 进入该阶段的理由 */
        reason: string
        /** 工作流模板标识 */
        workflow_template: string
        /** 是否需要创建 Agent 应用 */
        should_create_agent_app: boolean
        /** 是否需要治理/审批 */
        requires_governance: string
        /** 推荐的端点列表 */
        recommended_endpoints: string[]
        /** Agent 应用名称 */
        agent_app_name: string
        /** Agent 应用目标描述 */
        agent_app_goal: string
        /** 备注说明 */
        notes: string
      }
    }
    /** 顶层的规范化请求（与 completeness.normalized_request 结构相同） */
    normalized_request: {
      /** AI 理解摘要 */
      ai_summary: string
      /** 数据类型 */
      data_type: string | null
      /** 领域语言 */
      domain_language: string | null
      /** 性能目标 */
      performance_target: string | null
      /** 优先级 */
      priority: string | null
      /** 使用场景 */
      use_scenario: string | null
    }
    /** 当前阶段标识：intent 表示意图识别阶段 */
    stage: 'intent'
    /** 工作流提示（简化版） */
    workflow_hint: {
      /** 进入当前状态的理由 */
      reason: string
      /** 当前阶段标识 */
      stage: 'need_more_info'
    }
  }
  /** 执行结果数据（RAG 配置和训练参数） */
  result_data: {
    /** RAG 预设配置 */
    rag_preset: {
      /** 数据清洗任务 ID */
      clean_id: string
      /** 数据集 ID 映射 */
      dataset_ids: Record<number, string>
      /** RAG 配置项 */
      rag_cfg: {
        /** 向量数据库后端（如 pgvector、milvus） */
        backend: string
      }
      /** 文档分块配置 */
      chunk: {
        /** 分块重叠字符数 */
        overlap: number
        /** 分块大小（字符数） */
        size: number
      }
      /** 向量维度 */
      dim: number
      /** 嵌入模型名称（如 text-embedding-ada-002） */
      embedder: string
      /** 相似度计算方式（如 cosine、l2、ip） */
      metric: string
    }
    /** 推荐模型预设 */
    recommend_model_preset: {
      /** 模型约束条件 */
      constraints: unknown
      /** 任务类型（如 classification、generation、embedding） */
      task_type: string
      /** 额外文本信息 */
      text: string | null
    }
    /** 训练预设配置 */
    train_preset: {
      /** 基础模型名称（如 bert-base-uncased） */
      base_model: string
      /** 数据集 URI */
      dataset_uri: string
      /** 训练轮数 */
      epochs: number
      /** 学习率 */
      lr: number
      /** 训练方法（如 finetune、prompt_tuning） */
      method: string
    }
  }
}

export interface UserCardMessage extends BaseChatResponse {
  meta_data: null
  result_data: null
}

export type ChatResponse = UserCardMessage | CompletenessCardMessage | IntentCardMessage

export const chatApi = {
  async sendMessage(data: {
    role: 'user' | 'assistant'
    content: string
    session_id: string | undefined
  }) {
    return await http.post<Success<ChatResponse>>('/chat/sessions_chat', data)
  },
}
