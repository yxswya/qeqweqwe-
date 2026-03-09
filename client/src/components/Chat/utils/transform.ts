import type { BaseChatResponse } from '@/api/modules'
import type { RagBuildResponse } from '@/api/modules/rag'
import { generateUniqueId } from './helpers'

// 临时转化
export function transform(response: RagBuildResponse): BaseChatResponse {
  console.log(response)
  return {
    id: generateUniqueId(),
    role: 'assistant',
    session_id: generateUniqueId(),
    created_at: generateUniqueId(),
    content: '构建构建',
    meta_data: null,
    result_data: null,
  }
}
