import { request } from '../request'

export interface CanvasNode {
  id: string
  type: 'session' | 'message' | 'rag' | 'model' | 'train' | 'file'
  title: string
  data: Record<string, any>
  createdAt: string | null
}

export interface CanvasEdge {
  id: string
  source: string
  target: string
  type: 'contains' | 'produces' | 'trains' | 'registers'
  label?: string
}

export interface CanvasGraph {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

export interface CanvasResponse {
  code: number
  message: string
  data: CanvasGraph | null
}

export const canvasApi = {
  // 获取指定会话的图谱
  getSessionGraph: async (sessionId: string): Promise<CanvasResponse> => {
    const response = await request.get<CanvasResponse>(`/canvas/graph/${sessionId}`)
    return response.data
  },

  // 获取所有会话的图谱概览
  getAllGraphs: async (): Promise<CanvasResponse> => {
    const response = await request.get<CanvasResponse>('/canvas/graph')
    return response.data
  },
}
