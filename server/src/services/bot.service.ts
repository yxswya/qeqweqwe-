import type { ApiResponse } from '../types'
import { eq } from 'drizzle-orm'
import { db } from '../db'
import { logger } from '../logger'
import { parsePipeLine } from '../parse-pipeline'
import { conversations, messages } from '../schema'
import { hasAnswer } from '../types'
import { eventBus } from '../utils/event-bus'

/**
 * 保存机器人回复到数据库
 */
async function saveBotMessageToDB(
  conversationId: string,
  userMessageId: string,
  botMessageId: string,
  botResult: ApiResponse | string,
) {
  try {
    let result: any

    await db.transaction(async (tx) => {
      result = await tx.insert(messages).values({
        id: botMessageId,
        conversationId,
        userMessageId,
        senderId: 'system-bot-id',
        content: typeof botResult === 'string' ? botResult : JSON.stringify(botResult),
        messageType: 'system',
        createdAt: new Date(),
      }).returning()

      await tx.update(conversations)
        .set({ lastMessageAt: new Date() })
        .where(eq(conversations.id, conversationId))
    })

    return {
      botMessageId,
      result: result[0],
    }
  }
  catch (error) {
    logger.error(`[会话 ${conversationId}] 保存机器人回复到数据库时发生错误:`, error)

    return {
      success: true,
      message: '您的消息已发送，但机器人当前开小差了，请稍后再试。',
    }
  }
}

/**
 * 后台处理机器人回复
 * 不阻塞主线程，异步处理 AI 服务调用
 */
export async function processBotReplyInBackground(
  conversationId: string,
  userMessageId: string,
  botMessageId: string,
  content: string,
) {
  const eventName = `chat:${conversationId}`
  logger.info(`[会话 ${conversationId}] 开始处理机器人回复，用户消息内容: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`)

  const conversation = await db.select().from(conversations).where(eq(conversations.id, conversationId))
  if (!conversation || conversation.length === 0) {
    logger.error(`[会话 ${conversationId}] 会话不存在，无法处理机器人回复`)
    return
  }

  try {
    const botResult = await parsePipeLine(content, conversation[0]?.thirdSessionId || '')

    if (!botResult) {
      logger.error(`[会话 ${conversationId}] AI 服务返回空结果`)
      return
    }

    // 更新 session_id
    if (hasAnswer(botResult)) {
      await db.update(conversations).set({
        thirdSessionId: botResult.answer.session_id,
      })
    }
    else {
      await db.update(conversations).set({
        thirdSessionId: botResult.completeness.session_id,
      })
    }

    const { result } = await saveBotMessageToDB(conversationId, userMessageId, botMessageId, botResult)

    logger.info(`[会话 ${conversationId}] 机器人回复已保存，消息ID: ${botMessageId}`)

    eventBus.emit(eventName, {
      type: 'NEW_BOT_MESSAGE',
      data: { id: botMessageId, content: result },
    })

    if (!hasAnswer(botResult)) {
      if (botResult.intent.actions.includes('RAG_BUILD_INDEX')) {
        const ragBuildIndexId = crypto.randomUUID()
        const { result } = await saveBotMessageToDB(conversationId, botMessageId, ragBuildIndexId, 'RAG_BUILD_INDEX')
        eventBus.emit(eventName, {
          type: 'NEW_BOT_MESSAGE',
          data: { id: ragBuildIndexId, content: result },
        })
      }
    }
  }
  catch (e) {
    logger.error(`[会话 ${conversationId}] 处理机器人回复时发生错误:`, e)
    eventBus.emit(eventName, {
      type: 'ERROR',
      message: 'Failed to process message',
    })
  }
}
