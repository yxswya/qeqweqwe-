import { mkdir, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { cwd } from 'node:process'
import { jwt } from '@elysiajs/jwt'
import { desc, eq } from 'drizzle-orm'
import { Elysia, t } from 'elysia'
import { db } from '../db'
import { logger } from '../logger'
import { execRagBuild } from '../rag-build'
import { execRagBuildSync } from '../rag-build-sync'
import { conversations, messages, ragBuilds } from '../schema'
import { processBotReplyInBackground } from '../services/bot.service'
import { startRagBuildPolling } from '../services/rag-build-poll.service'

// 上传目录配置
const UPLOAD_DIR = join(cwd(), 'uploads')

// 确保上传目录存在
async function ensureUploadDir() {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
  catch (error) {
    logger.error('Failed to create upload directory:', error)
  }
}

const JWT_SECRET = 'Fischl von Luftschloss Narfidort'

/**
 * 消息相关路由
 * 依赖父路由提供 JWT 认证上下文
 */
export const messageRoutes = new Elysia()

  // JWT 配置
  .use(
    jwt({
      name: 'jwt',
      secret: JWT_SECRET,
    }),
  )
  // 签名路由（无需认证）
  .get('/sign/:name', async ({ jwt, params: { name }, cookie: { auth } }) => {
    const value = await jwt.sign({ name })
    auth.set({
      value,
      httpOnly: true,
      maxAge: 7 * 86400,
      path: '/api',
    })
    return `Sign in as ${value}`
  })
  // JWT 认证中间件（应用于后续所有路由）
  .derive(async ({ jwt, cookie: { auth }, status }) => {
    const profile = await jwt.verify(auth.value as string)
    const userId = profile?.name as string

    if (!profile)
      return status(401, 'Unauthorized')

    return { userId }
  })
  .post(
    '/conversations/:id/rag/build',
    async ({ params: { id: conversation_id }, body }) => {
      // 将文件路径转换为完整路径并计算总大小
      const filePaths = body.file_paths.map(path => join(cwd(), path.replace(/^\//, '')))
      let totalSize = 0

      // 计算所有文件的总大小
      for (const filePath of filePaths) {
        try {
          const stats = await stat(filePath)
          totalSize += stats.size
        }
        catch (error) {
          logger.error(`Failed to get file size for ${filePath}:`, error)
        }
      }

      logger.info(`Total file size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`)

      // 2MB 阈值
      const SIZE_THRESHOLD = 2 * 1024 * 1024

      // 根据文件大小选择调用不同的函数
      if (totalSize > SIZE_THRESHOLD) {
        // 大文件：使用异步提交
        const syncResult = await execRagBuildSync(filePaths)

        if (!syncResult?.job_id) {
          return { success: false, error: 'RAG build failed' }
        }

        const jobId = syncResult.job_id
        logger.info(`RAG build job submitted: ${jobId}`)

        // 保存异步任务信息
        const ragBuildData = {
          conversationId: conversation_id,
          runId: jobId,
          indexVersion: jobId,
          indexUri: '',
          manifestUri: '',
          embedder: '',
          metric: 'cosine' as const,
          dim: 0,
          elapsedMs: 0,
          cached: false,
          stats: {
            datasetSummary: {
              total: 0,
              bytes: totalSize,
              sources: filePaths,
              fallback: [],
              errors: [],
            },
            chunkDistribution: {
              min: 0,
              max: 0,
              avg: 0,
              count: 0,
            },
            embeddingDim: 0,
            embeddingModel: '',
          },
          createdAt: new Date(),
        }

        const inserted = await db.insert(ragBuilds).values(ragBuildData).returning()

        // 启动 RAG 构建轮询服务（后台运行，不阻塞响应）
        startRagBuildPolling(conversation_id, jobId)

        return {
          success: true,
          data: inserted[0],
          async: true,
          job_id: jobId,
        }
      }
      else {
        // 小文件：使用同步处理
        const result = await execRagBuild(filePaths)

        if (!result?.answer) {
          return { success: false, error: 'RAG build failed' }
        }

        const { answer } = result
        const indexVersion = answer.artifacts.index_version

        // 如果是缓存的结果，检查数据库中是否已存在
        if (answer.cached) {
          const existing = await db.query.ragBuilds.findFirst({
            where: eq(ragBuilds.indexVersion, indexVersion),
          })

          if (existing) {
            return { success: true, data: existing, cached: true }
          }
        }

        const ragBuildData = {
          conversationId: conversation_id,
          runId: indexVersion, // 使用 index_version 作为运行 ID
          indexVersion,
          indexUri: answer.artifacts.index_uri,
          manifestUri: answer.artifacts.manifest_uri,
          embedder: answer.artifacts.embedder,
          metric: answer.artifacts.metric,
          dim: answer.artifacts.dim,
          elapsedMs: answer.elapsed_ms,
          cached: answer.cached,
          stats: {
            datasetSummary: answer.stats.dataset_summary,
            chunkDistribution: answer.stats.chunk_distribution,
            embeddingDim: answer.stats.embedding_dim,
            embeddingModel: answer.stats.embedding_model,
          },
          createdAt: new Date(),
        }

        const inserted = await db.insert(ragBuilds).values(ragBuildData).returning()

        return { success: true, data: inserted[0], cached: false, async: false }
      }
    },
    {
      body: t.Object({
        file_paths: t.Array(t.String()),
      }),
    },
  )
  .get(
    '/conversations/:id/rag/builds',
    async ({ params: { id } }) => {
      const ragBuildsList = await db.query.ragBuilds.findMany({
        where: eq(ragBuilds.conversationId, id),
        orderBy: [desc(ragBuilds.createdAt)],
      })

      return { success: true, data: ragBuildsList }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      detail: {
        tags: ['RAG 管理'],
        summary: '获取会话的 RAG 构建列表',
        description: '获取指定会话的所有 RAG 构建记录。',
      },
    },
  )
  /**
   * 发送消息
   */
  .post(
    '/conversations/:id/messages',
    async ({ params: { id }, body, userId }) => {
      const botMessageId = crypto.randomUUID()
      const userMessageId = crypto.randomUUID()

      let result: any

      logger.info(`[会话 ${id}] 用户 ${userId} 发送消息: "${body.content.substring(0, 50)}${body.content.length > 50 ? '...' : ''}"`)

      await db.transaction(async (tx) => {
        result = await tx.insert(messages).values({
          id: userMessageId,
          conversationId: id,
          senderId: userId,
          content: body.content,
          messageType: body.messageType,
          createdAt: new Date(),
        }).returning()

        await tx.update(conversations)
          .set({ lastMessageAt: new Date() })
          .where(eq(conversations.id, id))
      })

      processBotReplyInBackground(id, userMessageId, botMessageId, body.content)

      return { success: true, data: result[0], botMessageId }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      body: t.Object({
        content: t.String({ minLength: 1 }),
        messageType: t.Union([
          t.Literal('text'),
          t.Literal('image'),
          t.Literal('system'),
        ]),
      }),
      detail: {
        tags: ['消息管理'],
        summary: '发送消息',
        description: '向指定会话发送一条消息。',
      },
    },
  )
  /**
   * 获取某个会话的历史消息 (分页)
   */
  .get(
    '/conversations/:id/messages',
    async ({ params: { id }, query }) => {
      const limit = query.limit || 20
      const offset = query.offset || 0

      const historyMessages = await db.query.messages.findMany({
        where: (messages, { eq }) => eq(messages.conversationId, id),
        with: {
          sender: {
            columns: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: (messages, { desc }) => [desc(messages.createdAt)],
        limit,
        offset,
      })

      return {
        success: true,
        data: historyMessages.reverse(),
      }
    },
    {
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        limit: t.Optional(t.Numeric()),
        offset: t.Optional(t.Numeric()),
      }),
      detail: {
        tags: ['消息管理'],
        summary: '获取历史消息',
        description: '获取指定会话的历史消息列表，支持分页查询。',
      },
    },
  )
  /**
   * 上传文件（支持多文件）
   */
  .post(
    '/upload',
    async ({ body }) => {
      await ensureUploadDir()

      const uploadedFiles: string[] = []
      const files = body.files as File[] | File

      const fileArray = Array.isArray(files) ? files : [files]

      for (const file of fileArray) {
        // 生成唯一文件名
        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 15)
        const fileExtension = file.name.split('.').pop() || ''
        const uniqueFileName = `${timestamp}_${randomStr}.${fileExtension}`
        const filePath = join(UPLOAD_DIR, uniqueFileName)

        // 将文件写入磁盘
        const buffer = await file.arrayBuffer()
        await Bun.write(filePath, buffer)

        // 返回相对路径
        uploadedFiles.push(`/uploads/${uniqueFileName}`)
      }

      logger.info(`Uploaded ${fileArray.length} file(s)`)

      return {
        success: true,
        data: uploadedFiles,
      }
    },
    {
      body: t.Object({
        files: t.Files({
          minItems: 1,
        }),
      }),
      detail: {
        tags: ['文件管理'],
        summary: '上传文件',
        description: '上传一个或多个文件，返回上传后的文件路径数组。',
      },
    },
  )
