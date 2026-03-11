import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import useStore from '../store'

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

function App() {
  const [statusText, setStatusText] = useState('')
  const [value, setValue] = useState('')
  const navigate = useNavigate()
  const { sessionId, status, fetchMessage } = useStore()

  useEffect(() => {
    if (sessionId) {
      navigate(`/app/dashboard/${sessionId}`)
    }
  }, [sessionId, navigate])

  const handleChat = async () => {
    setStatusText('准备连接...')
    fetchMessage(value)
  }

  return (
    <div style={{ padding: '20px' }}>

      {status === 'input' && (
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
            onClick={handleChat}
          >
            发送请求
          </button>
        </div>
      )}

      <Questions />

      <div style={{ marginTop: '20px', color: 'gray' }}>
        状态：
        {statusText}
        -
        {status}
      </div>
    </div>
  )
}

export default App
