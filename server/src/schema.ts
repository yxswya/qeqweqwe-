import type { InferInsertModel, InferSelectModel } from 'drizzle-orm'
import { relations } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { v4 as uuid } from 'uuid'

// 1. 用户表
export const users = sqliteTable('users', {
  id: text('id').$defaultFn(() => uuid()).primaryKey(),
  username: text('username').notNull().unique(),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

// 2. 会话表 (单聊或群聊)
export const conversations = sqliteTable('conversations', {
  id: text('id').$defaultFn(() => uuid()).primaryKey(),
  thirdSessionId: text('session_id'), // 三方会话的id
  title: text('title'), // 会话标题（群聊通常有名字，单聊可为空）
  isGroup: integer('is_group', { mode: 'boolean' }).notNull().default(false), // 是否是群聊
  // 作用：非常重要。你打开微信，为什么有的聊天在最上面，有的在最下面？就是因为每次有任何人往这个 conversationId 里发了新消息，都要把这个字段更新为 new Date()。
  // 前端的“会话列表”直接对这个字段进行 ORDER BY desc（倒序）排列。
  lastMessageAt: integer('last_message_at', { mode: 'timestamp_ms' })
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull(),
})

// 3. 参与者表 (多对多关联 Users 和 Conversations)
export const participants = sqliteTable(
  'participants',
  {
    conversationId: text('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: integer('joined_at', { mode: 'timestamp_ms' })
      .notNull(),
  },
  table => [
    // 联合主键：一个用户在一个会话中只能有一条记录
    primaryKey({ columns: [table.conversationId, table.userId] }),
  ],
)

// 4. 消息表
export const messages = sqliteTable('messages', {
  // 作用：每一条消息的唯一身份证。前端如果要做“撤回消息”、“点赞消息”或者“修改 Loading 状态”，都必须拿着这个 ID 去通知后端。
  id: text('id').$defaultFn(() => uuid()).primaryKey(),
  // 作用：用来划定界限。当你在“群聊 A”里发消息，这条消息绝不能跑到“群聊 B”里。获取历史记录时，where conversationId = '群聊A' 就能把属于它的消息全查出来。
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  // 作用：识别“谁”说了这句话。前端依靠它来决定聊天气泡放在屏幕左边（别人/机器人）还是屏幕右边（自己）。
  senderId: text('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // 发送者

  // 作用：这就是解决你“消息一一对应”问题的终极答案！
  replyToId: text('reply_to_id'), // 指向另一条消息的 ID

  // 作用：万能载体。如果是纯文本，直接存文本；如果是你的 parsePipeLine 吐出来的卡片结构，就把它 JSON.stringify() 变成字符串存进去。
  content: text('content').notNull(), // 消息内容
  // 作用：UI 渲染路由器。你的 content 就算存了 JSON，前端如果不知道这是什么卡片，也无法渲染。比如：
  // messageType = 'text' -> 前端用纯文本框渲染。
  // messageType = 'chart_data' -> 前端用 ECharts 组件渲染 JSON 里的图表数据。
  // messageType = 'error_card' -> 前端用一个带红色惊叹号的组件渲染。
  messageType: text('message_type', { enum: [
    'TEXT', // 純文本
    'IMAGE', // 图片
    'LOADING', // 加载状态
    'JSON', // 通用json
    'AGENT_CREATE', // 创建智能体：新建一个AI智能体实例
    'AGENT_UPDATE', // 更新智能体：修改现有智能体的配置或属性
    'WORKFLOW_CREATE', // 创建工作流：定义一个新的自动化流程
    'WORKFLOW_RUN', // 运行工作流：执行已定义的工作流实例
    'RAG_BUILD_INDEX', // 构建RAG索引：为检索增强生成创建或重建向量索引
    'RAG_QUERY', // 查询RAG：向知识库发起检索查询
    'TRAIN_START', // 开始训练：启动模型或智能体的训练任务
    'DATA_CLEAN', // 数据清洗：对原始数据进行预处理、过滤或格式化
    'DATA_IMPORT', // 数据导入：将外部数据加载到系统中
    'ASK_MORE_INFO_COMPLETENESS', // 不完整性校验 请求更多信息：在交互过程中向用户索要补充数据 stage: 'completeness'
    'ASK_MORE_INFO_INTENT', // 完整性校验 请求更多信息：在交互过程中向用户索要补充数据 stage: 'intent'
  ] })
    .notNull()
    .default('TEXT'), // 消息类型：文本、图片、系统提示等

  // messageStatus: text('message_status', { enum: ['train', 'normal', 'rag'] }).$defaultFn(() => 'normal'),
  // 作用：控制交互反馈。配合上一条回答里的 SSE 机制使用。
  // sending：后台在调第三方接口，前端显示水波纹/骨架屏 Loading。
  // success：接口调通了，显示真实的 content。
  // error：接口超时或报错了，前端显示一个“重试按钮”。
  status: text('status', { enum: ['sending', 'success', 'error'] })
    .notNull()
    .default('success'),

  // 作用：大盘排序。哪怕你用了 replyToId 来分组，整体的聊天流依然需要按照时间从上往下排。
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
})

export type SelectMessage = InferSelectModel<typeof messages>
export type InsertMessage = InferInsertModel<typeof messages>

// 5. RAG 构建产物表
export const ragBuilds = sqliteTable('rag_builds', {
  id: text('id').$defaultFn(() => uuid()).primaryKey(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  runId: text('run_id').notNull(), // RAG 构建的运行 ID
  indexVersion: text('index_version').notNull(), // 索引版本
  indexUri: text('index_uri').notNull(), // 索引 URI
  manifestUri: text('manifest_uri').notNull(), // 清单 URI
  embedder: text('embedder').notNull(), // 嵌入模型
  metric: text('metric').notNull(), // 度量方式 (cosine 等)
  dim: integer('dim').notNull(), // 向量维度
  elapsedMs: integer('elapsed_ms').notNull(), // 构建耗时
  cached: integer('cached', { mode: 'boolean' }).notNull().default(false), // 是否缓存
  stats: text('stats', { mode: 'json' }).$type<{
    datasetSummary: {
      total: number
      bytes: number
      sources: string[]
      fallback: string[]
      errors: string[]
    }
    chunkDistribution: {
      min: number
      max: number
      avg: number
      count: number
    }
    embeddingDim: number
    embeddingModel: string
  }>(), // 统计信息
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull(),
})

// ==========================================
// 定义 Relations (方便进行关系查询 query API)
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  participants: many(participants),
  messages: many(messages),
}))

export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(participants),
  messages: many(messages),
  ragBuilds: many(ragBuilds),
}))

export const participantsRelations = relations(participants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [participants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [participants.userId],
    references: [users.id],
  }),
}))

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  replyTo: one(messages, {
    fields: [messages.replyToId],
    references: [messages.id],
  }),
}))

export const ragBuildsRelations = relations(ragBuilds, ({ one }) => ({
  conversation: one(conversations, {
    fields: [ragBuilds.conversationId],
    references: [conversations.id],
  }),
}))
