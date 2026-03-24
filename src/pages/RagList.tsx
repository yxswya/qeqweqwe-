import { useParams } from 'react-router'
import RagListComponent from '@/components/RagList'

export default function RagList() {
  const { sessionId } = useParams()

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-slate-200 bg-white">
        <h1 className="text-lg font-semibold text-slate-800">RAG 知识库</h1>
        <p className="text-sm text-slate-500">
          {sessionId ? '查看当前会话中的知识库' : '查看所有知识库'}
        </p>
      </div>
      <div className="flex-1 overflow-auto bg-slate-50">
        <RagListComponent sessionId={sessionId} />
      </div>
    </div>
  )
}
