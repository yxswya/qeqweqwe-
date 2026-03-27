import { server } from '@/api/modules/session'

// 后端返回的模型数据结构（包含 sessionId）
export interface Model {
  id: string
  title: string
  messageId: string
  content: string
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
  sessionId: string // 关联的会话ID
}

export const modelApi = {
  // 获取所有模型列表 - 后端 GET /model/list/all
  getAllModels: async (): Promise<Model[]> => {
    const response = await server.api.v1.model.list.all.get()
    return (response.data || []) as Model[]
  },

  // 根据会话ID获取模型列表 - 后端 GET /model/session/:sessionId
  getModelsBySessionId: async (sessionId: string): Promise<Model[]> => {
    const response = await server.api.v1.model.session({ sessionId }).get()
    return (response.data || []) as Model[]
  },

  // 获取模型推荐 - 后端 GET /model/recommend
  getRecommendations: async () => {
    const response = await server.api.v1.model.recommend.get()
    return response.data
  },

  // 模型预测 - 后端 POST /model/predict
  predict: async (params: { model_id: string, prompt: string, max_new_tokens?: number, temperature?: number }) => {
    const response = await server.api.v1.model.predict.post(params)
    return response.data
  },
}
