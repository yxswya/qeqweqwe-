import type { InsertMessage, SelectMessage } from '../schema'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { conversations, messages } from '../schema'
import { eventBus } from '../utils/event-bus'

export abstract class Message {
  // 用户
  static async append(msg: InsertMessage) {
    return await db.transaction(async (tx) => {
      // 新增消息记录
      const [updatedMessage] = await tx.insert(messages)
        .values(msg)
        .returning()

      // 更新会话最新时间
      await tx.update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, msg.conversationId))

      return updatedMessage
    })
  }

  // 用户 + 机器人
  static async appendWithBot(userMsg: InsertMessage) {
    return await db.transaction(async (tx) => {
      // 新增用户消息记录
      const [updatedUserMessage] = await tx.insert(messages)
        .values(userMsg)
        .returning()

      // 新增机器人消息记录
      const [updatedBotMessage] = await tx.insert(messages)
        .values({
          conversationId: userMsg.conversationId,
          senderId: 'system-bot-id',
          content: 'loading',
          status: 'sending',
          messageType: 'TEXT',
        })
        .returning()

      // 更新会话最新时间
      await tx.update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, userMsg.conversationId))

      return [updatedUserMessage, updatedBotMessage]
    })
  }

  static async updateBotMessage(botMessage: SelectMessage, updatedBotMessage: Partial<SelectMessage>) {
    return await db.transaction(async (tx) => {
      const [updateMessage] = await tx.update(messages).set(updatedBotMessage).where(eq(messages.id, botMessage.id)).returning()

      await tx.update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, botMessage.conversationId))

      this.event('UPDATE_BOT_MESSAGE', updateMessage)

      return updateMessage
    })
  }

  static event(type: string, message: SelectMessage) {
    const eventName = `chat:${message.conversationId}`
    eventBus.emit(eventName, {
      type,
      data: { id: message.id, content: message },
    })
  }
}
