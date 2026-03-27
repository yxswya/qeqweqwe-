import type * as React from 'react'
import type { MessageResponse } from '../../utils/elysia'
import { Brain, Database, ExternalLink } from 'lucide-react'
import { Link } from 'react-router'
import useStore from '../../store'

const Products: React.FC = () => {
  const messages = useStore(state => state.messages) as MessageResponse[]
  const sessionId = useStore(state => state.sessionId)

  // 从消息中提取 rag 和 model（后端返回的是单数形式）
  const rags = messages
    .filter(msg => msg.rag)
    .map(msg => msg.rag!)

  const models = messages
    .filter(msg => msg.model)
    .map(msg => msg.model!)

  const hasProducts = rags.length > 0 || models.length > 0

  if (!hasProducts) {
    return null
  }

  return (
    <div className="space-y-3">
      {/* 知识库列表 */}
      {rags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Database className="w-4 h-4 text-indigo-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              知识库
            </span>
            <span className="text-xs text-slate-400">
              (
              {rags.length}
              )
            </span>
          </div>
          <div className="space-y-1.5">
            {rags.map((rag, index) => (
              <Link
                key={rag.id}
                to={`/rag-answer/${rag.id}/${sessionId}`}
                className="group flex items-center gap-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100/50 hover:border-indigo-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                  <Database className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 group-hover:text-indigo-700 transition-colors truncate">
                    {rag.title || `知识库 ${index + 1}`}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {rag.createdAt ? new Date(rag.createdAt).toLocaleDateString('zh-CN') : ''}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 模型列表 */}
      {models.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <Brain className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              训练模型
            </span>
            <span className="text-xs text-slate-400">
              (
              {models.length}
              )
            </span>
          </div>
          <div className="space-y-1.5">
            {models.map((model, index) => (
              <Link
                key={model.id}
                to={`/train-answer/${model.id}/${sessionId}`}
                className="group flex items-center gap-3 p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100/50 hover:border-emerald-200 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-center w-8 h-8 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                  <Brain className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 group-hover:text-emerald-700 transition-colors truncate">
                    {model.title || `模型 ${index + 1}`}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {model.createdAt ? new Date(model.createdAt).toLocaleDateString('zh-CN') : ''}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
