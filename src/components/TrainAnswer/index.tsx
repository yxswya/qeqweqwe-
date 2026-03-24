import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { server } from '@/api/modules/session'
import { ChatMain, ConversationList, type Conversation, type Message } from './components'

// 模型数据类型（从 API 返回）
interface ModelItem {
  id: string
  sessionId: string
  messageId: string
  trainId: string | null
  externalId: string
  modelUri: string
  task: string
  modelType: string
  note: string | null
  existsLocal: boolean | null
  fileSize: number | null
  mtime: string | null
  externalCreatedAt: string | null
  createdAt: string | Date
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

// 将模型数据转换为 Conversation 格式
function modelToConversation(model: ModelItem, index: number): Conversation {
  const avatarClasses = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']
  const createdAt = model.createdAt instanceof Date ? model.createdAt : new Date(model.createdAt)
  const time = model.createdAt
    ? createdAt.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    : '刚刚'

  // 从 modelUri 中提取模型名称
  const modelName = model.modelUri.split('/').pop() || model.modelUri

  return {
    id: model.id,
    name: model.note || modelName || `模型 ${index + 1}`,
    avatar: (model.note || modelName)?.charAt(0) || '模',
    avatarClass: avatarClasses[index % avatarClasses.length],
    preview: `${model.task} - ${model.modelType}`,
    time,
    online: model.existsLocal ?? true,
    externalId: model.externalId,
    modelUri: model.modelUri,
  }
}

// 生成欢迎消息
function createWelcomeMessage(): Message {
  return {
    id: Date.now(),
    content: '你好！我是智能助手，有什么可以帮助你的吗？',
    isUser: false,
    timestamp: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: 'read',
  }
}

function TrainAnswer() {
  const params = useParams<{ id: string, sessionId: string }>()
  const sessionId = params.sessionId

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<number | string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)

  // 获取模型列表
  useEffect(() => {
    async function fetchModelList() {
      if (!sessionId) {
        setIsLoading(false)
        return
      }

      try {
        const response = await server.api.v1.model.local({ sessionId }).get()
        if (response.data?.code === 0 && response.data.data) {
          const modelList = response.data.data as ModelItem[]
          const convList = modelList.map((model, index) => modelToConversation(model, index))
          setConversations(convList)

          // 如果有 id 参数，选中对应的模型
          if (params.id) {
            const targetConv = convList.find(c => c.id === params.id || c.externalId === params.id)
            if (targetConv) {
              setActiveConversation(targetConv.id)
              setMessages([createWelcomeMessage()])
            }
          }
          else if (convList.length > 0) {
            // 默认选中第一个
            setActiveConversation(convList[0].id)
            setMessages([createWelcomeMessage()])
          }
        }
      }
      catch (error) {
        console.error('获取模型列表失败:', error)
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchModelList()
  }, [sessionId, params.id])

  // 选择会话
  const handleSelectConversation = (id: number | string) => {
    setActiveConversation(id)
    // 清空消息，添加新的欢迎消息
    setMessages([createWelcomeMessage()])
    // 在移动端隐藏侧边栏
    if (window.innerWidth <= 768) {
      setShowSidebar(false)
    }
  }

  // 发送消息
  const handleSend = async () => {
    if (inputValue.trim() === '')
      return

    const currentConv = conversations.find(c => c.id === activeConversation)
    const modelId = currentConv?.externalId || params.id

    if (!modelId)
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
        model_id: modelId,
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
      <div className="w-full h-screen bg-[#f0f0f0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-4 bg-[#e8e0f0] text-[#6b4c8a]">
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
          <p className="text-sm text-[#6b7280]">正在加载模型列表...</p>
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
