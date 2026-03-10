import { relations } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core'
import { v4 as uuid } from 'uuid'

// 1. 用户表
export const users = sqliteTable('users', {
  id: text('id').$defaultFn(() => uuid()).primaryKey(), // 推荐在业务层使用 cuid 或 uuid 生成
  username: text('username').notNull().unique(),
  avatarUrl: text('avatar_url'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull(),
})

// 2. 会话表 (单聊或群聊)
export const conversations = sqliteTable('conversations', {
  id: text('id').$defaultFn(() => uuid()).primaryKey(),
  thirdSessionId: text('session_id'), // 三方会话的id
  title: text('title'), // 会话标题（群聊通常有名字，单聊可为空）
  isGroup: integer('is_group', { mode: 'boolean' }).notNull().default(false), // 是否是群聊
  lastMessageAt: integer('last_message_at', { mode: 'timestamp_ms' })
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull(),
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
  id: text('id').$defaultFn(() => uuid()).primaryKey(),
  conversationId: text('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  userMessageId: text('user_message_id'), // 只有机器人才会有数据
  senderId: text('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // 发送者
  content: text('content').notNull(), // 消息内容
  messageType: text('message_type', { enum: ['text', 'image', 'system'] })
    .notNull()
    .default('text'), // 消息类型：文本、图片、系统提示等
  messageStatus: text('message_status', { enum: ['train', 'normal', 'rag'] }).$defaultFn(() => 'normal'),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .notNull(),
})

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
}))

export const ragBuildsRelations = relations(ragBuilds, ({ one }) => ({
  conversation: one(conversations, {
    fields: [ragBuilds.conversationId],
    references: [conversations.id],
  }),
}))
