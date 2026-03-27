import type { CanvasNode } from '@/api/modules/canvas'
import { canvasApi } from '@/api/modules/canvas'
import { CanvasGraph, InfiniteCanvas } from '@/components/Canvas'
import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react'

export default function CanvasPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [graphData, setGraphData] = React.useState<{ nodes: any[], edges: any[] } | null>(null)
  const [selectedNode, setSelectedNode] = React.useState<CanvasNode | null>(null)

  const fetchGraph = React.useCallback(async () => {
    if (!sessionId)
      return

    try {
      setLoading(true)
      setError(null)
      const data = await canvasApi.getSessionGraph(sessionId)
      setGraphData(data)
    }
    catch (err) {
      setError((err as Error).message)
    }
    finally {
      setLoading(false)
    }
  }, [sessionId])

  React.useEffect(() => {
    fetchGraph()
  }, [fetchGraph])

  const handleNodeClick = (node: CanvasNode) => {
    setSelectedNode(node)
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">会话图谱</h1>
              <p className="text-sm text-slate-500">加载中...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>正在加载图谱数据...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-4 py-3 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">会话图谱</h1>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchGraph}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      {/* 头部 */}
      <div className="px-4 py-3 border-b border-slate-200 bg-white z-20 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-800">会话图谱</h1>
              <p className="text-sm text-slate-500">
                {sessionId ? `会话 ID: ${sessionId.slice(0, 12)}...` : '所有会话概览'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchGraph}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
        </div>
      </div>

      {/* 画布区域 */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
        {graphData && (
          <InfiniteCanvas className="w-full h-full">
            <CanvasGraph
              nodes={graphData.nodes}
              edges={graphData.edges}
              onNodeClick={handleNodeClick}
              selectedNodeId={selectedNode?.id}
            />
          </InfiniteCanvas>
        )}

        {/* 图例 - 固定在视口内 */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 p-4 z-30">
          <h4 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">图例</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-lg bg-blue-500 shadow-sm" />
              <span className="text-sm text-slate-600">会话</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-lg bg-emerald-500 shadow-sm" />
              <span className="text-sm text-slate-600">知识库 (RAG)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-lg bg-amber-500 shadow-sm" />
              <span className="text-sm text-slate-600">训练</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-lg bg-indigo-500 shadow-sm" />
              <span className="text-sm text-slate-600">模型</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded-lg bg-purple-500 shadow-sm" />
              <span className="text-sm text-slate-600">文件</span>
            </div>
          </div>
        </div>

        {/* 操作提示 */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-slate-200 px-4 py-2.5 z-30">
          <p className="text-sm text-slate-500">
            🖱️ 拖拽移动 · 滚轮缩放 · 点击节点查看详情
          </p>
        </div>

        {/* 选中节点详情面板 */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 w-80 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-slate-200 p-5 z-30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800 text-lg">{selectedNode.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedNode(null)}
                className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                ×
              </button>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">类型</span>
                <span className="text-slate-700 font-medium capitalize">{selectedNode.type}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">ID</span>
                <span className="text-slate-700 font-mono text-xs">{selectedNode.id}</span>
              </div>
              {selectedNode.createdAt && (
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">创建时间</span>
                  <span className="text-slate-700">
                    {new Date(selectedNode.createdAt).toLocaleString('zh-CN')}
                  </span>
                </div>
              )}
              {/* 显示额外数据 */}
              {Object.entries(selectedNode.data).map(([key, value]) => {
                if (value === null || value === undefined)
                  return null
                const displayValue = typeof value === 'string' && value.length > 30
                  ? `${value.slice(0, 30)}...`
                  : String(value)
                return (
                  <div key={key} className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">{key}</span>
                    <span className="text-slate-700 font-mono text-xs truncate max-w-40" title={String(value)}>
                      {displayValue}
                    </span>
                  </div>
                )
              })}
            </div>
            {/* 快捷操作按钮 */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2">
              {selectedNode.type === 'rag' && selectedNode.data.indexVersion && (
                <button
                  type="button"
                  onClick={() => navigate(`/rag-answer/${selectedNode.data.indexVersion}/${selectedNode.id}`)}
                  className="flex-1 px-3 py-2 text-sm bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors font-medium"
                >
                  打开问答
                </button>
              )}
              {selectedNode.type === 'model' && (
                <button
                  type="button"
                  onClick={() => navigate(`/train-answer/${selectedNode.id}/${sessionId}`)}
                  className="flex-1 px-3 py-2 text-sm bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
                >
                  打开对话
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
