import { eq } from 'drizzle-orm'
import { db } from '../db'
import { logger } from '../logger'
import { ragBuilds } from '../schema'
import { eventBus } from '../utils/event-bus'

const STATUS_API_URL = 'http://localhost:8002/api/exec/rag/status'
const LOGS_API_URL = 'http://localhost:8002/api/exec/rag/logs'

// 轮询间隔（毫秒）
const POLL_INTERVAL = 2000

// 最大轮询次数（约5分钟）
const MAX_POLL_ATTEMPTS = 150

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 获取 RAG 构建日志
 */
async function fetchRagBuildLogs(jobId: string): Promise<string[]> {
  const startTime = Date.now()
  logger.info(`[RAG 构建日志] 正在获取日志，任务: ${jobId}`)

  try {
    const response = await fetch(`${LOGS_API_URL}/${jobId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const elapsed = Date.now() - startTime
    logger.info(`[RAG 构建日志] 获取完成，耗时 ${elapsed}ms，状态码: ${response.status}`)

    if (!response.ok) {
      logger.warn(`[RAG 构建日志] 获取日志失败，任务 ${jobId}: ${response.statusText}`)
      return []
    }

    const result = await response.text()
    logger.debug(`[RAG 构建日志] 原始响应长度: ${result.length} 字符，任务: ${jobId}`)

    // 按行分割并过滤空行
    const logs = result.split('\n').filter((line: string) => line.trim())

    logger.info(`[RAG 构建日志] 获取到 ${logs.length} 条日志，任务: ${jobId}`)
    return logs
  }
  catch (error) {
    logger.error(`[RAG 构建日志] 获取日志时发生错误，任务 ${jobId}:`, error)
    return []
  }
}

/**
 * 启动 RAG 构建轮询服务
 * 通过 eventBus 推送构建进度到 SSE
 */
export async function startRagBuildPolling(conversationId: string, jobId: string) {
  const eventName = `chat:${conversationId}`
  let attempts = 0
  let lastLogLength = 0

  logger.info(`[RAG 构建轮询] 启动轮询服务，会话: ${conversationId}, 任务: ${jobId}`)

  try {
    while (attempts < MAX_POLL_ATTEMPTS) {
      attempts++
      logger.info(`[RAG 构建轮询] 第 ${attempts}/${MAX_POLL_ATTEMPTS} 次轮询，任务: ${jobId}`)

      const statusStartTime = Date.now()
      const response = await fetch(`${STATUS_API_URL}/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const statusElapsed = Date.now() - statusStartTime

      if (!response.ok) {
        logger.warn(`[RAG 构建轮询] 状态检查失败，任务 ${jobId}: ${response.status} ${response.statusText} (${statusElapsed}ms)`)
        await sleep(POLL_INTERVAL)
        continue
      }

      logger.info(`[RAG 构建轮询] 状态获取成功，任务 ${jobId} (${statusElapsed}ms)`)

      const result = await response.json()
      const answer = result.data.answer

      logger.info(`[RAG 构建轮询] 任务 ${jobId} 状态: ${answer?.state || '未知'}, 进度: ${answer?.progress || 0}`)

      // 获取日志
      const logs = await fetchRagBuildLogs(jobId)

      // 如果有新日志，推送给前端
      if (logs.length > lastLogLength) {
        const newLogs = logs.slice(lastLogLength)
        logger.info(`[RAG 构建轮询] 推送 ${newLogs.length} 条新日志到前端，任务: ${jobId}`)
        eventBus.emit(eventName, {
          type: 'rag_build_logs',
          data: {
            job_id: jobId,
            logs: newLogs,
          },
        })
        lastLogLength = logs.length
      }

      // 检查状态
      if (answer && answer.state) {
        // 通过 eventBus 发送进度更新
        logger.info(`[RAG 构建轮询] 进度更新，任务 ${jobId}: 状态=${answer.state}, 进度=${((answer.progress || 0) * 100).toFixed(0)}%`)
        eventBus.emit(eventName, {
          type: 'rag_build_progress',
          data: {
            job_id: jobId,
            state: answer.state,
            progress: answer.progress || 0,
            message: `构建中... ${((answer.progress || 0) * 100).toFixed(0)}%`,
          },
        })

        if (answer.state === 'succeeded' && answer.result) {
          // 构建成功
          const buildResult = answer.result
          logger.info(`[RAG 构建轮询] 构建成功，任务: ${jobId}，正在处理结果...`)

          // 发送完整日志
          if (logs.length > 0) {
            logger.info(`[RAG 构建轮询] 发送完整日志 (${logs.length} 条)，任务: ${jobId}`)
            eventBus.emit(eventName, {
              type: 'rag_build_logs',
              data: {
                job_id: jobId,
                logs,
              },
            })
          }

          // 通过 eventBus 发送完成事件
          logger.info(`[RAG 构建轮询] 发送完成事件，任务: ${jobId}`)
          eventBus.emit(eventName, {
            type: 'rag_build_complete',
            data: {
              job_id: jobId,
              result: buildResult,
            },
          })

          // 更新数据库记录
          logger.info(`[RAG 构建轮询] 更新数据库记录，任务: ${jobId}`)
          await db.update(ragBuilds)
            .set({
              indexVersion: buildResult.artifacts.index_version,
              indexUri: buildResult.artifacts.index_uri,
              manifestUri: buildResult.artifacts.manifest_uri,
              embedder: buildResult.artifacts.embedder,
              metric: buildResult.artifacts.metric,
              dim: buildResult.artifacts.dim,
              elapsedMs: buildResult.elapsed_ms,
              cached: buildResult.cached,
              stats: {
                datasetSummary: buildResult.stats.dataset_summary,
                chunkDistribution: buildResult.stats.chunk_distribution,
                embeddingDim: buildResult.stats.embedding_dim,
                embeddingModel: buildResult.stats.embedding_model,
              },
            })
            .where(eq(ragBuilds.runId, jobId))

          logger.info(`[RAG 构建轮询] 构建完成，任务: ${jobId}`)
          return
        }
        else if (answer.state === 'failed') {
          // 构建失败
          logger.error(`[RAG 构建轮询] 构建失败，任务: ${jobId}，错误: ${answer.error || '未知错误'}`)
          eventBus.emit(eventName, {
            type: 'rag_build_error',
            data: {
              job_id: jobId,
              message: answer.error || 'RAG 构建失败',
            },
          })
          return
        }
      }

      // 等待后继续轮询
      logger.debug(`[RAG 构建轮询] 等待 ${POLL_INTERVAL}ms 后继续轮询，任务: ${jobId}`)
      await sleep(POLL_INTERVAL)
    }

    // 超时
    if (attempts >= MAX_POLL_ATTEMPTS) {
      logger.error(`[RAG 构建轮询] 轮询超时 (${MAX_POLL_ATTEMPTS} 次尝试)，任务: ${jobId}`)
      eventBus.emit(eventName, {
        type: 'rag_build_error',
        data: {
          job_id: jobId,
          message: 'RAG 构建超时',
        },
      })
    }
  }
  catch (error) {
    logger.error(`[RAG 构建轮询] 轮询过程中发生异常，任务 ${jobId}:`, error)
    eventBus.emit(eventName, {
      type: 'rag_build_error',
      data: {
        job_id: jobId,
        message: error instanceof Error ? error.message : '未知错误',
      },
    })
  }
}
