import type { RagAnswerResponse } from '../Session/types/rag.ts'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import './style.css'

interface Message {
  id: number
  content: string
  isUser: boolean
  timestamp: string
}

// 模拟数据
const mockMessages: Message[] = [
  {
    id: 1,
    content: '你好！我是智能助手，有什么可以帮助你的吗？',
    isUser: false,
    timestamp: '10:00',
  },
  {
    id: 2,
    content: '请介绍一下什么是RAG技术？',
    isUser: true,
    timestamp: '10:01',
  },
  {
    id: 3,
    content: 'RAG（Retrieval-Augmented Generation）是一种结合了检索和生成的AI技术。它通过从外部知识库中检索相关信息，然后利用这些信息来生成更准确、更具体的回答。',
    isUser: false,
    timestamp: '10:01',
  },
  {
    id: 4,
    content: '那它有什么优势呢？',
    isUser: true,
    timestamp: '10:02',
  },
  {
    id: 5,
    content: 'RAG的主要优势包括：1. 提供最新信息，不受训练数据时间限制；2. 减少幻觉，回答更可靠；3. 可以引用来源，增加可解释性；4. 领域知识定制，适用于特定行业。',
    isUser: false,
    timestamp: '10:02',
  },
]

function RagAnswer() {
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const params = useParams<{ id: string }>()

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 发送消息
  const handleSend = () => {
    if (inputValue.trim() === '')
      return

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now(),
      content: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')

    // 模拟AI回复
    setIsTyping(true)

    fetch(`http://localhost:3002/api/v1/rag/chat/${params.id}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: inputValue,
      }),
    }).then(res => res.json()).then((data: RagAnswerResponse) => {
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: data.answer.text,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)
    })

    // setTimeout(() => {
    // const aiMessage: Message = {
    //   id: Date.now() + 1,
    //   content: `这是对"${inputValue}"的模拟回复。实际使用时，这里会连接到真实的RAG服务来获取基于知识库的答案。`,
    //   isUser: false,
    //   timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    // }
    // setMessages(prev => [...prev, aiMessage])
    // setIsTyping(false)
    // }, 1000)
  }

  // 按Enter发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="rag-answer-container">
      <div className="rag-answer-header">
        <h2>智能问答助手</h2>
        <p className="subtitle">基于RAG技术的知识问答系统</p>
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
                <div className="message-bubble">
                  {message.content}
                </div>
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

export default RagAnswer
