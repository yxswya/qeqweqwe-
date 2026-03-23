import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { server } from '@/api/modules/session'
import './style.css'

interface Message {
  id: number
  content: string
  isUser: boolean
  timestamp: string
}

interface ModelPredictResponse {
  code: number
  message: string
  data: {
    answer: {
      model_uri: string
      task: string
      prompt: string
      text: string
      max_new_tokens: number
      temperature: number
    }
    confidence: number
    sources: string[]
    error: string | null
  }
  trace_id: string
}

function TrainAnswer() {
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const params = useParams<{ id: string, sessionId: string }>()

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // 初始化
  useEffect(() => {
    if (!params.id) {
      setError('缺少 model_id 参数')
      setIsLoading(false)
      return
    }

    if (!params.sessionId) {
      setError('缺少 sessionId 参数')
      setIsLoading(false)
      return
    }

    // 添加欢迎消息
    setMessages([
      {
        id: Date.now(),
        content: '你好！我是智能助手，有什么可以帮助你的吗？',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      },
    ])
    setIsLoading(false)
  }, [params.id, params.sessionId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 发送消息
  const handleSend = async () => {
    if (inputValue.trim() === '' || !params.id || !params.sessionId)
      return

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now(),
      content: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsTyping(true)

    try {
      // 使用中转接口 POST /model/predict/:sessionId
      const response = await server.api.v1.model.predict.post({
        model_id: params.id,
        prompt: currentInput,
        max_new_tokens: 256,
      })

      const data = response.data as ModelPredictResponse

      if (data.code === 0 && data.data?.answer?.text) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: data.data.answer.text,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
        setMessages(prev => [...prev, aiMessage])
      }
      else {
        const errorMessage: Message = {
          id: Date.now() + 1,
          content: `抱歉，出现了错误：${data.message || '未知错误'}`,
          isUser: false,
          timestamp: new Date().toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
        setMessages(prev => [...prev, errorMessage])
      }
    }
    catch (err) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        content: '抱歉，网络连接失败，请稍后重试。',
        isUser: false,
        timestamp: new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }
      setMessages(prev => [...prev, errorMessage])
      console.error('发送消息失败:', err)
    }
    finally {
      setIsTyping(false)
    }
  }

  // 按Enter发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // 加载状态
  if (isLoading) {
    return (
      <div className="rag-answer-container">
        <div className="rag-answer-header">
          <h2>智能问答助手</h2>
          <p className="subtitle">正在连接模型服务...</p>
        </div>
        <div className="messages-container">
          <div className="loading-indicator">正在初始化会话，请稍候...</div>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="rag-answer-container">
        <div className="rag-answer-header">
          <h2>智能问答助手</h2>
          <p className="subtitle error">连接失败</p>
        </div>
        <div className="messages-container">
          <div className="error-message">
            <p>{error}</p>
            <p className="error-hint">请检查参数是否正确，或联系管理员</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rag-answer-container">
      <div className="rag-answer-header">
        <h2>智能问答助手</h2>
        <p className="subtitle">基于模型的知识问答系统</p>
      </div>

      <div className="messages-container">
        <div className="messages-list">
          {messages.map(message => (
            <div
              key={message.id}
              className={`message-item ${message.isUser ? 'user-message' : 'ai-message'}`}
            >
              <div className="message-avatar">
                {message.isUser ? '👤' : '🤖'}
              </div>
              <div className="message-content-wrapper">
                <div className="message-header">
                  <span className="message-sender">{message.isUser ? '你' : 'AI助手'}</span>
                  <span className="message-time">{message.timestamp}</span>
                </div>
                <div className="message-bubble">{message.content}</div>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="message-item ai-message">
              <div className="message-avatar">🤖</div>
              <div className="message-content-wrapper">
                <div className="message-header">
                  <span className="message-sender">AI助手</span>
                </div>
                <div className="message-bubble typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            className="message-input"
            placeholder="输入你的问题..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className={`send-button ${inputValue.trim() ? 'active' : ''}`}
            onClick={handleSend}
            disabled={!inputValue.trim()}
          >
            发送
          </button>
        </div>
        <div className="input-footer">
          <span className="tip">按 Enter 发送，Shift + Enter 换行</span>
        </div>
      </div>
    </div>
  )
}

export default TrainAnswer
