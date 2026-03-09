import { Elysia, t } from 'elysia'
import { db } from '../db'
import { logger } from '../logger'
import { execRagBuild } from '../rag-build'
import { conversations, participants } from '../schema'
import { eventBus } from '../utils/event-bus'

/**
 * 会话相关路由
 * 依赖父路由提供 JWT 认证上下文
 */
export const conversationRoutes = new Elysia()
  /**
   * 创建会话 (发起单聊或群聊)
   */
  .post(
    '/conversations',
    async ({ body, userId }) => {
      const { participantIds, isGroup, title } = body
      const conversationId = crypto.randomUUID()

      const allUserIds = Array.from(new Set([...participantIds, userId]))

      logger.info(`用户 ${userId} 创建${isGroup ? '群聊' : '单聊'}会话，标题: ${title || '无'}，参与者: ${allUserIds.join(', ')}`)

      await db.transaction(async (tx) => {
        await tx.insert(conversations).values({
          id: conversationId,
          isGroup,
          title: title || null,
          createdAt: new Date(),
          lastMessageAt: new Date(),
        })

        const participantsData = allUserIds.map(id => ({
          conversationId,
          userId: id,
          joinedAt: new Date(),
        }))
        await tx.insert(participants).values(participantsData)
      })

      return {
        success: true,
        data: { conversationId },
        message: '会话创建成功',
      }
    },
    {
      body: t.Object({
        participantIds: t.Array(t.String({ minLength: 1 }), {
          description: '除自己外的其他用户ID列表',
        }),
        isGroup: t.Boolean({ default: false }),
        title: t.Optional(t.String()),
      }),
      detail: {
        tags: ['会话管理'],
        summary: '创建会话',
        description: '创建一个新的聊天会话，支持单聊和群聊。创建成功后返回会话ID。',
      },
    },
  )
  /**
   * 获取当前用户的会话列表
   */
  .get(
    '/conversations',
    async ({ userId }) => {
      const userConversations = await db.query.participants.findMany({
        where: (participants, { eq }) => eq(participants.userId, userId),
        with: {
          conversation: {
            with: {
              participants: {
                with: {
                  user: {
                    columns: {
                      id: true,
                      username: true,
                      avatarUrl: true,
                    },
                  },
                },
              },
              messages: {
                orderBy: (messages, { desc }) => [desc(messages.createdAt)],
                limit: 1,
              },
            },
          },
        },
      })

      const formattedData = userConversations
        .map(p => p.conversation)
        .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime())

      return { success: true, data: formattedData }
    },
    {
      detail: {
        tags: ['会话管理'],
        summary: '获取会话列表',
        description: '获取当前用户参与的所有会话列表，按最后消息时间倒序排列。',
      },
    },
  )
  /**
   * SSE 实时推送
   */
  .get('/conversations/:id/sse', ({ params: { id }, request }) => {
    const stream = new ReadableStream({
      start(controller) {
        const listener = (message: any) => {
          controller.enqueue(`data: ${JSON.stringify(message)}\n\n`)
        }

        const eventName = `chat:${id}`
        eventBus.on(eventName, listener)

        request.signal.addEventListener('abort', () => {
          eventBus.off(eventName, listener)
          controller.close()
        })
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  })
