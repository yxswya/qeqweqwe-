import type { ApiResponse } from './types'
import { logger } from './logger'

// const apiUrl = 'http://192.168.20.131:8002/api/parse/pipeline'
const apiUrl = 'http://localhost:8002/api/parse/pipeline'

export async function parsePipeLine(text: string, session_id: string) {
  logger.info(`调用 AI 解析服务，session_id: ${session_id}`)
  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id,
        text,
        content: text,
        run_quality_check: false,
      }),
    })
    const res_1 = await res.json()

    // 保存响应数据到文件用于调试
    const filename = `parse-pipeline_${Date.now()}.json`
    await Bun.write(filename, JSON.stringify(res_1, null, 2))
    logger.debug(`AI 解析响应已保存到 ${filename}`)

    return res_1.data as ApiResponse
  }
  catch (err) {
    logger.error('AI 解析服务调用失败:', err)
    return undefined
  }
}
