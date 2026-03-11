import type { SelectMessage } from '../schema'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { conversations, messages } from '../schema'

// --- 类型定义区 ---
// 提取 Status 类型，方便统一管理和后续扩展
export type BotMessageStatus = SelectMessage['status']

// 使用接口定义上下文参数，避免参数顺序记错，且方便扩展
export interface BotReplyContext {
  conversationId: string
  replyToId?: string // 可选：并非所有消息都一定是回复某条具体消息
}

export class BotReply {
  public readonly id: string
  public readonly conversationId: string
  public readonly replyToId: string | null

  // 常量：抽离系统机器人的默认 ID
  private static readonly SYSTEM_BOT_ID = 'system-bot-id'

  constructor(context: BotReplyContext) {
    this.id = crypto.randomUUID()
    this.conversationId = context.conversationId
    this.replyToId = context.replyToId ?? null
  }

  // ==========================================
  // 静态方法：快捷一次性发送 (无状态)
  // ==========================================

  /**
   * 快捷发送一条不需要后续状态更新的消息
   * @example
   * await BotReply.send({ conversationId: '123' }, '欢迎使用！');
   */
  public static async send(
    context: BotReplyContext,
    content: string,
    status: BotMessageStatus = 'success',
  ) {
    const reply = new BotReply(context)
    return await reply.send(content, status)
  }

  // ==========================================
  // 实例方法：生命周期管理 (有状态)
  // ==========================================

  /**
   * 1. 发送初始消息 (适用于长耗时任务，先发送 loading 占位)
   */
  public async send(content: string, status: BotMessageStatus = 'success') {
    return await db.transaction(async (tx) => {
      const [newMessage] = await tx.insert(messages).values({
        id: this.id,
        conversationId: this.conversationId,
        replyToId: this.replyToId,
        content,
        status,
        senderId: BotReply.SYSTEM_BOT_ID,
      }).returning()

      await this._touchConversation(tx)
      return newMessage
    })
  }

  /**
   * 2. 编辑/更新当前消息 (例如：大模型流式输出完毕，更新为 success)
   */
  public async edit(content: string, status: BotMessageStatus = 'success') {
    return await db.transaction(async (tx) => {
      const [updatedMessage] = await tx.update(messages)
        .set({ content, status })
        .where(eq(messages.id, this.id))
        .returning()

      await this._touchConversation(tx)
      return updatedMessage
    })
  }

  /**
   * 3. 快捷失败方法 (语法糖)：大模型请求失败时直接调用
   */
  public async fail(errorMessage: string = '抱歉，系统处理失败，请稍后再试。') {
    return await this.edit(errorMessage, 'error')
  }

  // ==========================================
  // 私有辅助方法
  // ==========================================

  /**
   * 刷新会话的最后活跃时间 (提取公共逻辑)
   * 注：any 可以替换为你的 Drizzle 事务类型，例如 `PgTransaction<...>` 或 `ExtractTablesWithRelations<...>`
   */
  private async _touchConversation(tx: any) {
    await tx.update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, this.conversationId))
  }
}
