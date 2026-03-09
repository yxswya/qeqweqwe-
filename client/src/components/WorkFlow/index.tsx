import * as React from 'react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import MessageComponent from '@/components/Chat/Message'
import { useStore } from './store'

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

const Input: React.FC = () => {
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

const Questions: React.FC = () => {
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

const RagBuildList: React.FC = () => {
  const ragBuild = useStore(state => state.ragBuild)
  return <div>{
      ragBuild.map(rag => {
        return <div key={rag.id}>
          <button
        className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
      >
        {rag.indexVersion}</button>
        </div>
      })
    }</div>
}

const WorkFlow: React.FC = () => {
  const { status, initSession, getMessages, clearSession } = useStore()
  const params = useParams()

  React.useEffect(() => {
    if (params.id) {
      initSession(params.id)
      getMessages()
    }
    else {
      clearSession()
    }
  }, [getMessages, initSession, params.id])
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
