import type { Conversation, Message } from './components'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { server } from '@/api/modules/session'
import { ChatMain, ConversationList } from './components'

// 模型使用提示
interface UsageHint {
  env: Record<string, string>
  cli_example: string
}

// 注册的模型信息（存储在 content 字段中的 JSON）
interface RegisteredModel {
  id: string // externalId，用于模型预测
  model_uri: string
  task: string
  model_type: string
  note: string
  exists_local: boolean
  file_size: number
  mtime: string
  created_at: string
  usage_hint: UsageHint
}

// 模型注册响应内容
interface ModelContent {
  answer: RegisteredModel
  confidence: number
  sources: string[]
  error: string | null
}

// 模型数据类型（从 API 返回，匹配后端 SelectModel）
interface ModelItem {
  id: string
  title: string
  messageId: string
  content: string // JSON 字符串，需要解析为 ModelContent
  deletedAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
}

interface ModelPredictResponse {
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

// 解析模型 content 字段
function parseModelContent(contentStr: string): ModelContent | null {
  try {
    return JSON.parse(contentStr)
  }
  catch {
    console.error('Failed to parse model content:', contentStr)
    return null
  }
}

// 将模型数据转换为 Conversation 格式
function modelToConversation(model: ModelItem, index: number): Conversation | null {
  const avatarClasses = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']
  const time = model.createdAt
    ? new Date(model.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    : '刚刚'

  // 解析 content 字段获取模型信息
  const content = parseModelContent(model.content)
  if (!content?.answer?.id) {
    console.warn('Model item missing externalId:', model.id)
    return null
  }

  const registeredModel = content.answer
  // 从 model_uri 中提取模型名称
  const modelName = registeredModel.model_uri.split('/').pop() || registeredModel.model_uri

  return {
    id: model.id,
    name: model.title || registeredModel.note || modelName || `模型 ${index + 1}`,
    avatar: (model.title || registeredModel.note || modelName)?.charAt(0) || '模',
    avatarClass: avatarClasses[index % avatarClasses.length],
    preview: `${registeredModel.task} - ${registeredModel.model_type}`,
    time,
    online: registeredModel.exists_local ?? true,
    externalId: registeredModel.id,
    modelUri: registeredModel.model_uri,
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
  const navigate = useNavigate()
  const sessionId = params.sessionId

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<number | string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSidebar, setShowSidebar] = useState(true)

  // 获取模型列表的函数
  const fetchModelList = useCallback(async () => {
    if (!sessionId) {
      setIsLoading(false)
      return
    }

    try {
      // 使用 API 路径 GET /model/session/:sessionId
      const response = await server.api.v1.model.list.get()
      if (response.data) {
        const modelList = response.data as ModelItem[]
        // 过滤掉解析失败的模型项
        const convList = modelList
          .map((model, index) => modelToConversation(model, index))
          .filter((c): c is Conversation => c !== null)
        setConversations(convList)

        // 如果有 id 参数，选中对应的模型（通过 id 匹配）
        if (params.id) {
          const targetConv = convList.find(c => c.id === params.id)
          if (targetConv) {
            setActiveConversation(targetConv.id)
            setMessages([createWelcomeMessage()])
          }
          else if (convList.length > 0) {
            // 如果没找到匹配的，默认选中第一个
            setActiveConversation(convList[0].id)
            setMessages([createWelcomeMessage()])
          }
        }
        else if (convList.length > 0 && !activeConversation) {
          // 默认选中第一个（仅当没有选中项时）
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
  }, [sessionId, params.id, activeConversation])

  // 初始加载模型列表
  useEffect(() => {
    fetchModelList()
  }, [])

  // 监听 model_created 事件，刷新列表
  useEffect(() => {
    const handleModelCreated = () => {
      console.log('收到 model_created 事件，刷新列表')
      fetchModelList()
    }

    window.addEventListener('model_created', handleModelCreated)
    return () => {
      window.removeEventListener('model_created', handleModelCreated)
    }
  }, [fetchModelList])

  // 选择会话
  const handleSelectConversation = (id: number | string) => {
    setActiveConversation(id)
    // 清空消息，添加新的欢迎消息
    setMessages([createWelcomeMessage()])
    // 更新地址栏 URL
    if (sessionId) {
      navigate(`/train-answer/${sessionId}/${id}`)
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

      if (data?.answer?.text) {
        const aiMessage: Message = {
          id: Date.now() + 1,
          content: data.answer.text,
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
          content: `抱歉，出现了错误：${data.error || '未知错误'}`,
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
