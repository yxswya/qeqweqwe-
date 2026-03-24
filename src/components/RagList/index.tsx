import type { Rag } from '@/api/modules/rag'
import { Database, FileText, Hash, Layers, Sparkles } from 'lucide-react'
import * as React from 'react'
import { useNavigate } from 'react-router'
import { ragApi } from '@/api/modules/rag'

interface RagListProps {
  sessionId?: string
}

function formatDate(dateStr: string | null): string {
  if (!dateStr)
    return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

const RagCard: React.FC<{ rag: Rag }> = ({ rag }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/rag-answer/${rag.indexVersion}/${rag.sessionId}`)
  }

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 truncate max-w-50" title={rag.title}>
              {rag.title}
            </h3>
            <p className="text-xs text-slate-400">{rag.id}</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-md text-xs font-medium bg-emerald-100 text-emerald-700">
          RAG
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Hash className="w-4 h-4 text-slate-400" />
          <span className="truncate font-mono text-xs" title={rag.indexVersion}>{rag.indexVersion}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="truncate">
            消息 ID:
            {rag.messageId}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Layers className="w-4 h-4 text-slate-400" />
          <span>
            会话:
            {rag.sessionId}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
        <span>
          创建于
          {formatDate(rag.createdAt)}
        </span>
        <span className="text-emerald-500">点击查看</span>
      </div>
    </div>
  )
}

const RagList: React.FC<RagListProps> = ({ sessionId }) => {
  const [rags, setRags] = React.useState<Rag[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchRags = async () => {
      try {
        setLoading(true)
        const response = sessionId
          ? await ragApi.getLocalRags(sessionId)
          : await ragApi.getAllRags()
        if (response.code === 0) {
          setRags(response.data)
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

    fetchRags()
  }, [sessionId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-500 rounded-full animate-spin" />
          <span>加载 RAG 列表...</span>
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

  if (rags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-400">
        <Sparkles className="w-12 h-12 mb-3 opacity-50" />
        <p>暂无 RAG 知识库</p>
        <p className="text-sm mt-1">构建知识库后，RAG 将显示在这里</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {rags.map(rag => (
        <RagCard key={rag.id} rag={rag} />
      ))}
    </div>
  )
}

export default RagList
