import ModelListComponent from '@/components/ModelList'
import { useParams } from 'react-router'

export default function ModelList() {
  const { sessionId } = useParams()

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <h1 className="text-lg font-semibold text-slate-800">模型列表</h1>
        <p className="text-sm text-slate-500">
          {sessionId ? '查看当前会话中已注册的模型' : '查看所有已注册的模型'}
        </p>
      </div>
      <div className="flex-1 overflow-auto bg-slate-50">
        <ModelListComponent sessionId={sessionId} />
      </div>
    </div>
  )
}
