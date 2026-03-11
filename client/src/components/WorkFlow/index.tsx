import * as React from 'react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import MessageComponent from '@/components/Chat/Message'
import { useStore } from '@/components/Session/store/index.ts'

export const List: React.FC = () => {
  const { messages } = useStore()

  return (
    <div className="space-y-3 p-4">
      {
        messages.map(msg => <MessageComponent message={msg} key={msg.id} />)
      }
    </div>
  )
}

export const Input: React.FC = () => {
  const [value, setValue] = useState('')
  const { fetchMessage, createSession } = useStore()
  const params = useParams()
  const navigate = useNavigate()

  const sendMessage = async () => {
    if (!params.id) {
      const sessionId = await createSession()
      navigate(`/app/dashboard/${sessionId}`)
    }

    fetchMessage(value)
    setValue('')
  }
  return (
    <div className="bg-amber-50 p-4 rounded-t-lg border border-amber-200 shrink-0">
      <textarea
        className="w-full p-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
        rows={3}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="请输入您的问题..."
      />
      <button
        className="mt-3 px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        onClick={sendMessage}
      >
        发送
      </button>
    </div>
  )
}

export const Questions: React.FC = () => {
  const { clarificationQuestions, fetchMessage } = useStore()
  return (
    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 space-y-4 shrink-0">
      {
        clarificationQuestions.map((question) => {
          return (
            <div key={question.id} className="space-y-3">
              <p className="text-gray-700 font-medium">{question.question}</p>
              <div className="flex flex-wrap gap-2">
                {question.options.map((opt) => {
                  return (
                    <span
                      key={opt.value}
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
                      onClick={() => {
                        fetchMessage(opt.label)
                      }}
                    >
                      {opt.label}
                    </span>
                  )
                })}
              </div>
            </div>
          )
        })
      }
    </div>
  )
}

export const RagBuildList: React.FC = () => {
  const ragBuild = useStore(state => state.ragBuild)
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('zh-CN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }
  const formatElapsed = (ms: number) => {
    if (ms < 1000)
      return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="space-y-3 p-4">
      {
        ragBuild.map((rag) => {
          return (
            <div
              key={rag.id}
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{rag.indexVersion}</span>
                <span className="text-xs text-gray-400">{formatDate(rag.createdAt)}</span>
              </div>
              <div className="space-y-1 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span>
                    📄
                    {' '}
                    {rag.stats?.datasetSummary?.total || 0}
                    {' '}
                    个文档
                  </span>
                  <span>•</span>
                  <span>
                    {rag.stats?.chunkDistribution?.count || 0}
                    {' '}
                    个分块
                  </span>
                  <span>•</span>
                  <span>{formatElapsed(rag.elapsedMs)}</span>
                </div>
                <div className="text-gray-400 truncate">
                  {rag.embedder?.split('/')?.[1] || rag.embedder}
                </div>
              </div>
            </div>
          )
        })
      }

      {/* {JSON.stringify(ragBuildProgress)}
      {JSON.stringify(ragBuildLogs)} */}
      {/* <div className="mt-3">
        <div className="text-xs font-medium text-gray-600 mb-2">构建日志</div>
        <div className="bg-gray-900 text-gray-100 rounded p-2 max-h-40 overflow-y-auto">
          <pre className="text-xs font-mono whitespace-pre-wrap">
            {logs.map((log, i) => (
              <div key={`${log}-${i}`} className="py-0.5">{log}</div>
            ))}
          </pre>
        </div>
      </div> */}
    </div>
  )
}

const WorkFlow: React.FC = () => {
  const { status, initConversation, getMessages, clearSession } = useStore()
  const params = useParams()

  React.useEffect(() => {
    if (params.id) {
      initConversation(params.id)
      getMessages()
    }
    else {
      clearSession()
    }
  }, [getMessages, initConversation, params.id])
  return (
    <div className="h-full flex flex-col">
      {/* <List /> */}
      <RagBuildList />
      {status === 'loading' && <span>思考中...</span>}
      {status === 'input' && <Input />}
      {status === 'questions' && <Questions /> }
    </div>
  )
}

export default WorkFlow
