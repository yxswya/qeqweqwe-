import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { server } from '@/api/modules/session'
import { ChatMain, ConversationList, type Conversation, type Message } from './components'

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

// 模拟会话列表
const mockConversations: Conversation[] = [
  {
    id: 1,
    name: '模型助手',
    avatar: '模',
    avatarClass: 'a2',
    preview: '基于训练模型的知识问答',
    time: '刚刚',
    online: true,
  },
  {
    id: 2,
    name: '推理服务',
    avatar: '推',
    avatarClass: 'a4',
    preview: '高性能模型推理',
    time: '10分钟前',
    unread: 1,
  },
]

function TrainAnswer() {
  const params = useParams<{ id: string, sessionId: string }>()

  const [conversations] = useState(mockConversations)
  const [activeConversation, setActiveConversation] = useState<number>(1)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)

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
        status: 'read',
      },
    ])
    setIsLoading(false)
  }, [params.id, params.sessionId])

  // 选择会话
  const handleSelectConversation = (id: number) => {
    setActiveConversation(id)
    if (window.innerWidth <= 768) {
      setShowSidebar(false)
    }
  }

  // 发送消息
  const handleSend = async () => {
    if (inputValue.trim() === '' || !params.id || !params.sessionId)
      return

    const userMessage: Message = {
      id: Date.now(),
      content: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'sent',
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsTyping(true)

    try {
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
          status: 'read',
        }
        setMessages(prev => [...prev, aiMessage])

        // 更新用户消息状态
        setMessages(prev =>
          prev.map(msg =>
            msg.id === userMessage.id ? { ...msg, status: 'read' } : msg,
          ),
        )
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
          status: 'read',
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
        status: 'read',
      }
      setMessages(prev => [...prev, errorMessage])
      console.error('发送消息失败:', err)
    }
    finally {
      setIsTyping(false)
    }
  }

  // 获取当前会话信息
  const currentConv = conversations.find(c => c.id === activeConversation)

  // 加载状态
  if (isLoading) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#e8e0f0] text-[#6b4c8a]">
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <p className="text-sm text-[#6b7280]">正在连接模型服务...</p>
        </div>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="w-full h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 bg-red-100 text-red-500">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm text-[#1a1a1a] font-medium mb-1">{error}</p>
          <p className="text-xs text-[#9ca3af]">请检查参数是否正确，或联系管理员</p>
        </div>
      </div>
    )
  }

  return (
    // 外层容器：居中 + 灰色背景
    <div
      className="w-full h-screen bg-[#f0f0f0] flex items-center justify-center
        overflow-hidden p-0"
    >
      {/* 聊天容器：960px * 760px 居中 */}
      <div
        className="w-full max-w-[960px] h-[92vh] max-h-[760px] bg-white flex overflow-hidden
          shadow-[0_20px_60px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.04)]
          rounded-2xl relative"
      >
        {/* Sidebar */}
        <div
          className={`md:flex transition-all duration-400 ${
            showSidebar ? 'flex' : 'hidden md:flex'
          } absolute md:relative inset-0 md:inset-auto z-20 md:z-auto
          w-full md:w-auto bg-white md:bg-transparent`}
        >
          <ConversationList
            conversations={conversations}
            activeId={activeConversation}
            onSelect={handleSelectConversation}
            onNewChat={() => {}}
          />
        </div>

        {/* Chat Main */}
        <ChatMain
          title={currentConv?.name || '模型助手'}
          subtitle="基于训练模型的知识问答系统"
          online={currentConv?.online}
          messages={messages}
          isTyping={isTyping}
          inputValue={inputValue}
          onInputChange={setInputValue}
          onSend={handleSend}
          onBack={() => setShowSidebar(true)}
          showBack={!showSidebar}
        />
      </div>
    </div>
  )
}

export default TrainAnswer
