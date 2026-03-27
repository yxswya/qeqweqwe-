import type { MessageResponse } from '@/components/Session/utils/elysia'
import type { FileResponse } from '@/components/Session/utils/elysia'
import { Brain, Database, FileText, ArrowLeft, ExternalLink } from 'lucide-react'
import * as React from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { server } from '@/api/modules/session'

interface ProductData {
  rags: Array<{ id: string, title: string, content: string, createdAt?: Date }>
  models: Array<{ id: string, title: string, content: string, createdAt?: Date }>
  files: FileResponse[]
}

export default function CanvasPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [data, setData] = React.useState<ProductData>({ rags: [], models: [], files: [] })

  const fetchData = React.useCallback(async () => {
    if (!sessionId)
      return

    try {
      setLoading(true)
      setError(null)

      const response = await server.api.v1.session.detail({ sessionId }).get()

      if (response.data) {
        const messages = (response.data.messages || []) as MessageResponse[]
        const files = (response.data.governanceFiles || []) as FileResponse[]

        // 从消息中提取 rag 和 model
        const rags = messages
          .filter(msg => msg.rag)
          .map(msg => msg.rag!)

        const models = messages
          .filter(msg => msg.model)
          .map(msg => msg.model!)

        setData({ rags, models, files })
      }
    }
    catch (err) {
      setError((err as Error).message)
    }
    finally {
      setLoading(false)
    }
  }, [sessionId])

  React.useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">产物中心</h1>
              <p className="text-sm text-slate-500">加载中...</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
            <span className="text-lg">正在加载产物数据...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="px-6 py-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">产物中心</h1>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-xl p-8">
            <p className="text-red-500 mb-6 text-lg">{error}</p>
            <button
              type="button"
              onClick={fetchData}
              className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors font-medium shadow-lg shadow-indigo-500/30"
            >
              重试
            </button>
          </div>
        </div>
      </div>
    )
  }

  const hasProducts = data.rags.length > 0 || data.models.length > 0 || data.files.length > 0

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* 头部 */}
      <div className="px-6 py-4 border-b border-slate-200/80 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">产物中心</h1>
              <p className="text-sm text-slate-500">
                {sessionId ? `会话 ${sessionId.slice(0, 8)}...` : '所有产物'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full font-medium">
              <Database className="w-4 h-4" />
              {data.rags.length} 知识库
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full font-medium">
              <Brain className="w-4 h-4" />
              {data.models.length} 模型
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-full font-medium">
              <FileText className="w-4 h-4" />
              {data.files.length} 文件
            </span>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        {!hasProducts
          ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Database className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-700 mb-2">暂无产物</h3>
                  <p className="text-slate-500">开始构建知识库或训练模型后，产物将在这里展示</p>
                </div>
              </div>
            )
          : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 知识库列 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 sticky top-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 py-2 z-10">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Database className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">知识库</h2>
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-600 text-xs font-semibold rounded-full">
                      {data.rags.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {data.rags.map((rag, index) => (
                      <Link
                        key={rag.id}
                        to={`/rag-answer/${rag.id}/${sessionId}`}
                        className="group block bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
                            <Database className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider">
                                RAG-{String(index + 1).padStart(2, '0')}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold text-slate-800 mt-1 group-hover:text-indigo-600 transition-colors truncate">
                              {rag.title || `知识库 ${index + 1}`}
                            </h3>
                            {rag.createdAt && (
                              <p className="text-xs text-slate-400 mt-1.5">
                                {new Date(rag.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                        </div>
                      </Link>
                    ))}
                    {data.rags.length === 0 && (
                      <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        暂无知识库
                      </div>
                    )}
                  </div>
                </div>

                {/* 模型列 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 sticky top-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 py-2 z-10">
                    <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">训练模型</h2>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-full">
                      {data.models.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {data.models.map((model, index) => (
                      <Link
                        key={model.id}
                        to={`/train-answer/${model.id}/${sessionId}`}
                        className="group block bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-emerald-300 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/30">
                            <Brain className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
                                MODEL-{String(index + 1).padStart(2, '0')}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold text-slate-800 mt-1 group-hover:text-emerald-600 transition-colors truncate">
                              {model.title || `模型 ${index + 1}`}
                            </h3>
                            {model.createdAt && (
                              <p className="text-xs text-slate-400 mt-1.5">
                                {new Date(model.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                          <ExternalLink className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors shrink-0" />
                        </div>
                      </Link>
                    ))}
                    {data.models.length === 0 && (
                      <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        暂无训练模型
                      </div>
                    )}
                  </div>
                </div>

                {/* 治理文件列 */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 sticky top-0 bg-gradient-to-r from-slate-50 via-white to-slate-50 py-2 z-10">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-amber-600" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-800">治理文件</h2>
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-semibold rounded-full">
                      {data.files.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {data.files.map((file, index) => (
                      <div
                        key={file.id}
                        className="group bg-white rounded-2xl border border-slate-200/80 p-5 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                                FILE-{String(index + 1).padStart(2, '0')}
                              </span>
                            </div>
                            <h3 className="text-base font-semibold text-slate-800 mt-1 truncate">
                              {file.filename}
                            </h3>
                            {file.createdAt && (
                              <p className="text-xs text-slate-400 mt-1.5">
                                {new Date(file.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {data.files.length === 0 && (
                      <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        暂无治理文件
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
      </div>
    </div>
  )
}
