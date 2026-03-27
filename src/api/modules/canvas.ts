import { server } from '@/api/modules/session'

// Canvas 节点类型
export interface CanvasNode {
  id: string
  type: 'session' | 'message' | 'rag' | 'model' | 'train' | 'file'
  title: string
  data: Record<string, any>
  createdAt: string | null
}

// Canvas 边类型
export interface CanvasEdge {
  id: string
  source: string
  target: string
  type: 'contains' | 'produces' | 'trains' | 'registers'
  label?: string
}

// Canvas 图谱类型
export interface CanvasGraph {
  nodes: CanvasNode[]
  edges: CanvasEdge[]
}

export const canvasApi = {
  // 获取指定会话的图谱 - 后端 GET /canvas/graph/:sessionId
  getSessionGraph: async (sessionId: string): Promise<CanvasGraph> => {
    const response = await server.api.v1.canvas.graph({ sessionId }).get()
    return (response.data || { nodes: [], edges: [] }) as CanvasGraph
  },

  // 获取所有会话的图谱概览 - 后端 GET /canvas/graph
  getAllGraphs: async (): Promise<CanvasGraph> => {
    const response = await server.api.v1.canvas.graph.get()
    return (response.data || { nodes: [], edges: [] }) as CanvasGraph
  },
}
