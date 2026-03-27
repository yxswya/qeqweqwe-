import type { Model } from '@/api/modules/model'
import { Box, Sparkles } from 'lucide-react'
import * as React from 'react'
import { useNavigate } from 'react-router'
import { modelApi } from '@/api/modules/model'

interface ModelListProps {
  sessionId?: string
}

function formatDate(date: Date | null): string {
  if (!date)
    return '-'
  return new Date(date).toLocaleString('zh-CN')
}

const ModelCard: React.FC<{ model: Model }> = ({ model }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    // 使用 sessionId 和 model.id 作为路由参数
    navigate(`/train-answer/${model.sessionId}/${model.id}`)
  }

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
            <Box className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 truncate max-w-50" title={model.title}>
              {model.title}
            </h3>
            <p className="text-xs text-slate-400">{model.id}</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-700">
          模型
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="text-slate-400">内容:</span>
          <span className="truncate" title={model.content}>{model.content.slice(0, 50)}...</span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>
          创建于
          {formatDate(model.createdAt)}
        </span>
      </div>
    </div>
  )
}

const ModelList: React.FC<ModelListProps> = ({ sessionId }) => {
  const [models, setModels] = React.useState<Model[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true)
        // 使用新的 API 方法
        const data = sessionId
          ? await modelApi.getModelsBySessionId(sessionId)
          : await modelApi.getAllModels()
        setModels(data)
      }
      catch (err) {
        setError((err as Error).message)
      }
      finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-indigo-500 rounded-full animate-spin" />
          <span>加载模型列表...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (models.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Sparkles className="w-12 h-12 mb-3 opacity-50" />
        <p>暂无模型</p>
        <p className="text-sm mt-1">完成训练后，模型将显示在这里</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {models.map(model => (
        <ModelCard key={model.id} model={model} />
      ))}
    </div>
  )
}

export default ModelList
