import { useState } from 'react'
import { useParams } from 'react-router'
import { server } from '@/api/modules/session'
import ChatMain from './components/ChatMain'
import ConversationList, { type Conversation } from './components/ConversationList'
import type { Message } from './components/MessageItem'

// 模拟会话列表
const mockConversations: Conversation[] = [
  {
    id: 1,
    name: 'AI 助手',
    avatar: 'AI',
    avatarClass: 'a1',
    preview: '基于 RAG 技术的知识问答',
    time: '2分钟前',
    online: true,
  },
  {
    id: 2,
    name: '技术支持',
    avatar: '技',
    avatarClass: 'a2',
    preview: '有什么技术问题可以问我',
    time: '28分钟前',
    unread: 3,
  },
  {
    id: 3,
    name: '文档助手',
    avatar: '文',
    avatarClass: 'a3',
    preview: '帮助你整理和分析文档',
    time: '1小时前',
  },
]

// 模拟消息数据
const mockMessages: Message[] = [
  {
    id: 1,
    content: '你好！我是智能助手，有什么可以帮助你的吗？',
    isUser: false,
    timestamp: '10:00',
    status: 'read',
  },
  {
    id: 2,
    content: '请介绍一下什么是RAG技术？',
    isUser: true,
    timestamp: '10:01',
    status: 'read',
  },
  {
    id: 3,
    content: 'RAG（Retrieval-Augmented Generation）是一种结合了检索和生成的AI技术。它通过从外部知识库中检索相关信息，然后利用这些信息来生成更准确、更具体的回答。',
    isUser: false,
    timestamp: '10:01',
    status: 'read',
  },
  {
    id: 4,
    content: '那它有什么优势呢？',
    isUser: true,
    timestamp: '10:02',
    status: 'read',
  },
  {
    id: 5,
    content: 'RAG的主要优势包括：1. 提供最新信息，不受训练数据时间限制；2. 减少幻觉，回答更可靠；3. 可以引用来源，增加可解释性；4. 领域知识定制，适用于特定行业。',
    isUser: false,
    timestamp: '10:02',
    status: 'read',
  },
]

function RagAnswer() {
  const params = useParams<{ id: string }>()

  const [conversations] = useState(mockConversations)
  const [activeConversation, setActiveConversation] = useState<number>(1)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)

  // 选择会话
  const handleSelectConversation = (id: number) => {
    setActiveConversation(id)
    // 在移动端隐藏侧边栏
    if (window.innerWidth <= 768) {
      setShowSidebar(false)
    }
  }

  // 发送消息
  const handleSend = () => {
    if (inputValue.trim() === '')
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
    server.api.v1.rag.chat({ index_version: String(params.id) }).post({
      text: inputValue,
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
        title={currentConv?.name || 'AI 助手'}
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
