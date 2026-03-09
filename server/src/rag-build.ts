import type { RagBuildParams, RagBuildResponse, Success } from './types'
import { logger } from './logger'

// const apiUrl = 'http://192.168.20.131:8002/api/parse/pipeline'
const apiUrl = 'http://localhost:8002/api/exec/rag/build'

export async function execRagBuild(dataset_ids: string[]) {
  const ragParams: RagBuildParams = {
    rag_cfg: {
      backend: 'file',
      embedder: 'sentence-transformers/all-MiniLM-L6-v2',
    },
    dataset_ids,
  }

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ragParams),
    })
    const res_1 = await res.json() as Success<RagBuildResponse>

    // 保存响应数据到文件用于调试
    const filename = `rag-build_${Date.now()}.json`
    await Bun.write(filename, JSON.stringify(res_1, null, 2))

    return res_1.data as RagBuildResponse
  }
  catch (err) {
    logger.error('AI RAG BUILD 服务调用失败:', err)
    return undefined
  }
}
