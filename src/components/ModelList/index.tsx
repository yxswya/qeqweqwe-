import type { Model } from '@/api/modules/model'
import { Box, Cpu, Database, FileCode, HardDrive, Sparkles } from 'lucide-react'
import * as React from 'react'
import { useNavigate } from 'react-router'
import { modelApi } from '@/api/modules/model'

interface ModelListProps {
  sessionId?: string
}

function formatFileSize(bytes: number | null): string {
  if (!bytes)
    return '-'
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr)
    return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const taskTypeMap: Record<string, { label: string, color: string }> = {
  'chat': { label: '对话', color: 'bg-blue-100 text-blue-700' },
  'text-generation': { label: '文本生成', color: 'bg-purple-100 text-purple-700' },
  'classification': { label: '分类', color: 'bg-green-100 text-green-700' },
}

const ModelCard: React.FC<{ model: Model }> = ({ model }) => {
  const navigate = useNavigate()
  const taskInfo = taskTypeMap[model.task] || { label: model.task, color: 'bg-gray-100 text-gray-700' }

  const handleClick = () => {
    navigate(`/train-answer/${model.id}/${model.sessionId}`)
  }

  const handleViewRag = (e: React.MouseEvent) => {
    e.stopPropagation()
    // 如果有关联的 RAG ID，直接高亮该 RAG
    if (model.ragId) {
      navigate(`/app/rags/${model.sessionId}?highlight=${model.ragId}`)
    }
    else {
      navigate(`/app/rags/${model.sessionId}`)
    }
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
            <h3 className="font-semibold text-slate-800 truncate max-w-50" title={model.note || model.externalId}>
              {model.note || model.externalId}
            </h3>
            <p className="text-xs text-slate-400">{model.id}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-md text-xs font-medium ${taskInfo.color}`}>
          {taskInfo.label}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FileCode className="w-4 h-4 text-slate-400" />
          <span className="truncate" title={model.modelUri}>{model.modelUri}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Cpu className="w-4 h-4 text-slate-400" />
          <span>{model.modelType}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <HardDrive className="w-4 h-4 text-slate-400" />
          <span>{formatFileSize(model.fileSize)}</span>
          {model.existsLocal && (
            <span className="px-1.5 py-0.5 rounded bg-green-100 text-green-600 text-xs">本地</span>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>
          创建于
          {formatDate(model.createdAt)}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleViewRag}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
          >
            <Database className="w-3 h-3" />
            <span>查看 RAG</span>
          </button>
          {model.trainId && (
            <span className="text-indigo-500">关联训练</span>
          )}
        </div>
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
        const response = sessionId
          ? await modelApi.getLocalModels(sessionId)
          : await modelApi.getAllModels()
        if (response.code === 0) {
          setModels(response.data)
        }
        else {
          setError(response.message)
        }
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
