import type { MessageResponse } from '../utils/elysia.ts'

export type Message = MessageResponse

export interface Option {
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

/**
 * 操作类型枚举
 * @remarks 用于标识系统中发生的各种原子操作，常用于日志记录、权限控制或状态机
 */
export type ActionType
  = | 'AGENT_CREATE' // 创建智能体：新建一个AI智能体实例
    | 'AGENT_UPDATE' // 更新智能体：修改现有智能体的配置或属性
    | 'WORKFLOW_CREATE' // 创建工作流：定义一个新的自动化流程
    | 'WORKFLOW_RUN' // 运行工作流：执行已定义的工作流实例
    | 'RAG_BUILD_INDEX' // 构建RAG索引：为检索增强生成创建或重建向量索引
    | 'RAG_QUERY' // 查询RAG：向知识库发起检索查询
    | 'TRAIN_START' // 开始训练：启动模型或智能体的训练任务
    | 'DATA_CLEAN' // 数据清洗：对原始数据进行预处理、过滤或格式化
    | 'DATA_IMPORT' // 数据导入：将外部数据加载到系统中
    | 'ASK_MORE_INFO' // 请求更多信息：在交互过程中向用户索要补充数据

/**
 * 产物类型
 * @remarks 指系统在运行或构建过程中生成的可复用、可部署或可存储的输出
 */
export type ArtifactType
  = | 'vector_index' // 向量索引：用于RAG检索的向量数据库索引数据
    | 'model' // 模型文件：训练完成的机器学习模型权重或架构
    | 'endpoint' // API端点：已部署服务的访问URL或标识
    | 'report' // 报告文档：数据分析、训练日志或执行结果总结
    | 'package' // 软件包：打包好的代码、依赖或容器镜像
    | 'agent_app' // 智能体应用：可独立运行的智能体程序或配置
    | 'workflow' // 工作流配置：自动化流程的定义文件或元数据

/**
 * 流程阶段状态
 * @remarks 用于标记当前对话或任务流程所处的阶段，指导下一步操作
 */
export type StageType
  = | 'ready_for_agent_create' // 就绪状态：可以创建新的智能体（所有前置条件已满足） [已满足条件，可以调用创建 Agent 的接口]
    | 'ready_for_workflow_create' // 就绪状态：可以创建新的工作流 [已满足条件，可以调用创建 Workflow 的接口]
    | 'continue' // 继续状态：流程正常推进，无需额外输入即可执行下一步 [尚未到创建阶段，需要继续后续步骤或补充信息]
    | 'need_more_info' // 等待状态：缺少必要信息，需要用户补充数据后才能继续 [用户描述不足，建议先向用户追问]
    | 'none' // 无阶段：初始状态或未定义阶段，通常表示流程尚未开始或已结束 [不涉及 agent/workflow 或与流程图无强关联]

export interface ApiResponseAnswer {
  stage: 'completeness'
  answer: {
    session_id: string
    next_action: string
    clarification_questions: ClarificationQuestion[]
    normalized_request: {
      ai_summary: string
    }
  }
}

// ========================================
// 1. intent 类型：从给定列表中严格选择
// ========================================
export type Intent
  = | 'agent.create'
    | 'agent.update'
    | 'agent.describe'
    | 'workflow.create'
    | 'workflow.update'
    | 'workflow.run'
    | 'rag.index'
    | 'rag.retrieve'
    | 'rag.evaluate'
    | 'train.start'
    | 'train.evaluate'
    | 'data.clean'
    | 'data.import'
    | 'data.inspect'
    | 'billing.pay'
    | 'exec.run'
    | 'orders.query'
    | 'auth.login'
    | 'auth.logout'
    | 'ops.audit'
    | 'other.unknown'

// ========================================
// 2. domain 类型：从给定列表中严格选择
// ========================================
export type Domain
  = | 'agent'
    | 'workflow'
    | 'rag'
    | 'train'
    | 'data'
    | 'billing'
    | 'exec'
    | 'orders'
    | 'auth'
    | 'ops'
    | 'other'

// ========================================
// 3. sub_intent 类型
//    方案 A：严格联合类型（仅包含示例值，适用于值集固定场景）
//    方案 B：宽松字符串（接受任何 string，但 IDE 会提示示例值，推荐）
// ========================================

// 方案 A：严格联合（如果业务确保不会出现其他值）
export type SubIntentStrict
  = | 'create'
    | 'update'
    | 'debug'
    | 'describe'
    | 'delete' // agent
    | 'create'
    | 'update'
    | 'run'
    | 'list'
    | 'describe' // workflow
    | 'create_index'
    | 'update_index'
    | 'query'
    | 'evaluate' // rag
    | 'start'
    | 'resume'
    | 'stop'
    | 'evaluate' // train
    | 'clean'
    | 'import'
    | 'export'
    | 'inspect' // data
    | 'pay'
    | 'invoice'
    | 'balance'
    | 'usage' // billing
    | 'run_script'
    | 'run_sql'
    | 'run_shell' // exec
    | 'query'
    | 'cancel'
    | 'create' // orders
    | 'login'
    | 'logout'
    | 'refresh' // auth
    | 'audit'
    | 'log_query' // ops
    | 'unknown' // fallback

// 方案 B：宽松类型（推荐，兼顾类型提示与扩展性）
export type SubIntent
  = | 'create'
    | 'update'
    | 'debug'
    | 'describe'
    | 'delete'
    | 'create'
    | 'update'
    | 'run'
    | 'list'
    | 'describe'
    | 'create_index'
    | 'update_index'
    | 'query'
    | 'evaluate'
    | 'start'
    | 'resume'
    | 'stop'
    | 'evaluate'
    | 'clean'
    | 'import'
    | 'export'
    | 'inspect'
    | 'pay'
    | 'invoice'
    | 'balance'
    | 'usage'
    | 'run_script'
    | 'run_sql'
    | 'run_shell'
    | 'query'
    | 'cancel'
    | 'create'
    | 'login'
    | 'logout'
    | 'refresh'
    | 'audit'
    | 'log_query'
    | 'unknown'
  // 允许其他未列出的字符串，同时保留上述字面量提示
    | (string & {})

export interface ApiResponseIntent {
  stage: 'intent'
  completeness: {
    session_id: string
  }
  workflow_hint: {
    reason: string
    stage: StageType
  }
  intent: {
    /** 顶层意图，用于路由到具体业务能力 */
    intent: Intent
    /** 业务域，用于粗粒度路由 */
    domain: Domain
    /** 细分意图，不同 domain 下有典型取值 */
    sub_intent: SubIntent // 如使用严格模式可替换为 SubIntentStrict
    actions: Array<ActionType>
    artifacts: Array<ArtifactType>
    priority: 'low' | 'normal' | 'high' | 'urgent'
    confidence: number // 可信度：当前意图识别结果的信心分数
  }
}

export type ApiResponse = ApiResponseAnswer | ApiResponseIntent

// 类型守卫
export function hasAnswer(obj: any): obj is ApiResponseAnswer {
  return 'answer' in obj
}
