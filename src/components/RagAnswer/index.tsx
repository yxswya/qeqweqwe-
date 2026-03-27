import type { Conversation } from './components/ConversationList'
import type { Message } from './components/MessageItem'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { server } from '@/api/modules/session'
import ChatMain from './components/ChatMain'
import ConversationList from './components/ConversationList'

// RAG 构建响应中的 artifacts 结构
interface RagArtifacts {
  index_version: string
  index_uri: string
  bm25_uri: string
}

// RAG 结果
interface RagResult {
  run_id: string
  stage: string
  cached: boolean
  artifacts: RagArtifacts
  stats: {
    load_ms: number
    chunk_ms: number
    embed_ms: number
    index_ms: number
  }
}

// RAG 构建响应内容（存储在 content 字段中的 JSON）
interface RagContent {
  answer: {
    rag: RagResult
    governance: unknown[]
  }
  confidence: number
  sources: string[]
  idempotency_key: string
}

// RAG 数据类型（从 API 返回，匹配后端 SelectRag）
interface RagItem {
  id: string
  title: string
  messageId: string
  content: string // JSON 字符串，需要解析为 RagContent
  deletedAt: Date | null
  createdAt: Date | null
  updatedAt: Date | null
}

// 解析 RAG content 字段
function parseRagContent(contentStr: string): RagContent | null {
  try {
    return JSON.parse(contentStr)
  }
  catch {
    console.error('Failed to parse RAG content:', contentStr)
    return null
  }
}

// 将 RAG 数据转换为 Conversation 格式
function ragToConversation(rag: RagItem, index: number): Conversation | null {
  const avatarClasses = ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']
  const time = rag.createdAt
    ? new Date(rag.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    : '刚刚'

  // 解析 content 字段获取 index_version
  const content = parseRagContent(rag.content)
  if (!content?.answer?.rag?.artifacts?.index_version) {
    console.warn('RAG item missing index_version:', rag.id)
    return null
  }

  const indexVersion = content.answer.rag.artifacts.index_version

  return {
    id: rag.id,
    name: rag.title || `RAG ${index + 1}`,
    avatar: rag.title?.charAt(0) || 'R',
    avatarClass: avatarClasses[index % avatarClasses.length],
    preview: `索引: ${indexVersion.slice(0, 8)}...`,
    time,
    online: true,
    indexVersion,
  }
}

function RagAnswer() {
  const params = useParams<{ id: string, sessionId: string }>()
  const sessionId = params.sessionId

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<number | string | null>(null)
  const [messages, setMessages] = useState<Message[]>(() => [])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  // 生成欢迎消息
  const createWelcomeMessage = (): Message => ({
    id: Date.now(),
    content: '你好！我是智能助手，有什么可以帮助你的吗？',
    isUser: false,
    timestamp: new Date().toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    status: 'read',
  })

  // 获取 RAG 列表
  useEffect(() => {
    async function fetchRagList() {
      if (!sessionId) {
        setIsLoading(false)
        return
      }

      try {
        // 使用新的 API 路径 GET /rag/list/:sessionId
        const response = await server.api.v1.rag.list({ sessionId }).get()
        if (response.data) {
          const ragList = response.data as RagItem[]
          // 过滤掉解析失败的 RAG 项
          const convList = ragList
            .map((rag, index) => ragToConversation(rag, index))
            .filter((c): c is Conversation => c !== null)
          setConversations(convList)

          // 如果有 id 参数，选中对应的 RAG（通过 id 匹配）
          if (params.id) {
            const targetConv = convList.find(c => c.id === params.id)
            if (targetConv) {
              setActiveConversation(targetConv.id)
              // 设置欢迎消息
              setMessages([createWelcomeMessage()])
            }
            else if (convList.length > 0) {
              // 如果没找到匹配的，默认选中第一个
              setActiveConversation(convList[0].id)
              setMessages([createWelcomeMessage()])
            }
          }
          else if (convList.length > 0) {
            // 默认选中第一个
            setActiveConversation(convList[0].id)
            // 设置欢迎消息
            setMessages([createWelcomeMessage()])
          }
        }
      }
      catch (error) {
        console.error('获取 RAG 列表失败:', error)
      }
      finally {
        setIsLoading(false)
      }
    }

    fetchRagList()
  }, [sessionId, params.id])

  // 选择会话
  const handleSelectConversation = (id: number | string) => {
    setActiveConversation(id)
    // 清空消息，添加新的欢迎消息
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
    // 在移动端隐藏侧边栏
    if (window.innerWidth <= 768) {
      setShowSidebar(false)
    }
  }

  // 发送消息
  const handleSend = () => {
    if (inputValue.trim() === '')
      return

    const currentConv = conversations.find(c => c.id === activeConversation)
    const indexVersion = currentConv?.indexVersion || params.id

    if (!indexVersion)
      return

    const userMessage: Message = {
      id: Date.now(),
      content: inputValue,
      isUser: true,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      status: 'sent',
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // 调用 API
    server.api.v1.rag.chat.post({
      text: inputValue,
      index_version: indexVersion,
    }).then((res) => {
      if (!res.data)
        return
      const aiMessage: Message = {
        id: Date.now() + 1,
        content: res.data.answer.text,
        isUser: false,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      }
      setMessages(prev => [...prev, aiMessage])
      setIsTyping(false)

      // 更新用户消息状态
      setMessages(prev =>
        prev.map(msg =>
          msg.id === userMessage.id ? { ...msg, status: 'read' } : msg,
        ),
      )
    }).catch(() => {
      setIsTyping(false)
    })
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
          <p className="text-sm text-[#6b7280]">正在加载 RAG 列表...</p>
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
        className="w-full max-w-240 h-[92vh] max-h-190 bg-white flex overflow-hidden
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
          title={currentConv?.name || 'RAG 助手'}
          subtitle="基于 RAG 技术的知识问答系统"
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

export default RagAnswer
