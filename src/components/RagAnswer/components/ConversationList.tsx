import { Search, SquarePen } from 'lucide-react'
import * as React from 'react'

export interface Conversation {
  id: number | string
  name: string
  avatar: string
  avatarClass: string
  preview: string
  time: string
  unread?: number
  online?: boolean
  // 扩展字段用于 RAG
  indexVersion?: string
}

interface ConversationListProps {
  conversations: Conversation[]
  activeId: number | string | null
  onSelect: (id: number | string) => void
  onNewChat?: () => void
}

const avatarColors: Record<string, string> = {
  a1: 'bg-[#e8e0f0] text-[#6b4c8a]',
  a2: 'bg-[#dbeafe] text-[#3b73b8]',
  a3: 'bg-[#d1fae5] text-[#2d8a5e]',
  a4: 'bg-[#fef3c7] text-[#a16b1a]',
  a5: 'bg-[#fee2e2] text-[#b84040]',
  a6: 'bg-[#e0e7ff] text-[#4f5fb3]',
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filteredConversations, setFilteredConversations] = React.useState(conversations)

  React.useEffect(() => {
    if (!searchQuery) {
      setFilteredConversations(conversations)
      return
    }
    const query = searchQuery.toLowerCase()
    setFilteredConversations(
      conversations.filter(
        c => c.name.toLowerCase().includes(query) || c.preview.toLowerCase().includes(query),
      ),
    )
  }, [searchQuery, conversations])

  return (
    <aside
      className="w-80 min-w-80 border-r border-[#f0f0f0] flex flex-col bg-white
        transition-all duration-400"
    >
      {/* Header */}
      <div className="px-6 pt-7 pb-5 flex items-center justify-between">
        <h1 className="text-[22px] font-bold tracking-[-0.5px] text-[#1a1a1a]">
          消息
        </h1>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onNewChat}
            className="w-[38px] h-[38px] rounded-lg border-none bg-transparent cursor-pointer
              flex items-center justify-center text-[#6b7280] transition-all duration-150
              relative overflow-hidden hover:text-[#1a1a1a]
              before:content-[''] before:absolute before:inset-0 before:bg-[#1a1a1a]
              before:opacity-0 before:rounded-inherit hover:before:opacity-5
              active:scale-[0.92]"
            title="新建对话"
          >
            <SquarePen size={18} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mx-6 mb-4 relative">
        <input
          type="text"
          placeholder="搜索对话..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full h-[42px] border border-[#e8e8e8] rounded-xl px-4 pl-[42px]
            text-[13px] font-inherit bg-white text-[#1a1a1a] outline-none
            transition-all duration-250 placeholder:text-[#9ca3af]
            focus:border-[#1a1a1a] focus:shadow-[0_0_0_3px_rgba(26,26,26,0.06)]"
        />
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9ca3af] transition-colors"
        />
      </div>

      {/* Conversation List */}
      <div
        className="flex-1 overflow-y-auto px-3 pb-3
          [&::-webkit-scrollbar]:w-1
          [&::-webkit-scrollbar-track]:bg-transparent
          [&::-webkit-scrollbar-thumb]:bg-[#e8e8e8] [&::-webkit-scrollbar-thumb]:rounded"
      >
        <div className="text-[11px] font-semibold text-[#9ca3af] uppercase tracking-[0.8px] px-3 py-4 pt-0">
          最近
        </div>

        {filteredConversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-150 relative
              ${activeId === conv.id
                ? 'bg-[#1a1a1a]'
                : 'hover:bg-[#f8f9fa]'
              }`}
          >
            {/* Avatar */}
            <div
              className={`w-11 h-11 min-w-11 rounded-full flex items-center justify-center
                text-[15px] font-semibold relative transition-all duration-150
                ${avatarColors[conv.avatarClass]}
                ${activeId === conv.id ? 'shadow-[0_0_0_2px_rgba(255,255,255,0.3)]' : ''}`}
            >
              {conv.avatar}
              {conv.online && (
                <span
                  className={`w-2.5 h-2.5 bg-[#34d399] rounded-full absolute bottom-0 right-0
                    border-2 ${activeId === conv.id ? 'border-[#1a1a1a]' : 'border-white'}`}
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span
                  className={`text-sm font-medium transition-colors duration-150
                    ${activeId === conv.id ? 'text-white' : 'text-[#1a1a1a]'}`}
                >
                  {conv.name}
                </span>
                <span
                  className={`text-[11px] transition-colors duration-150
                    ${activeId === conv.id ? 'text-white/40' : 'text-[#9ca3af]'}`}
                >
                  {conv.time}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[12.5px] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px] transition-colors duration-150
                    ${activeId === conv.id ? 'text-white/60' : 'text-[#6b7280]'}`}
                >
                  {conv.preview}
                </span>
                {conv.unread && conv.unread > 0 && (
                  <span
                    className={`min-w-[18px] h-[18px] text-[10px] font-semibold rounded-[10px]
                      flex items-center justify-center px-[5px]
                      ${activeId === conv.id
                        ? 'bg-white text-[#1a1a1a]'
                        : 'bg-[#1a1a1a] text-white'
                      }`}
                  >
                    {conv.unread}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

export default ConversationList
