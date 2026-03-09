import type { Message } from '@/components/WorkFlow/store'
import * as React from 'react'
import { getComponent } from './utils/messageConverter'

const MessageComponent: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.senderId !== 'system-bot-id'
  return (
    <>
      {/* 注入关键帧动画 */}
      <style>
        {`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.5) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes typingBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-5px); opacity: 1; }
        }
        `}
      </style>
      <div
        key={message.id}
        className={`flex items-start px-4 gap-5.5 ${isUser && 'flex-row-reverse'}`}
      >
        <div>
          {
            isUser
              ? (
                  <div>
                    <img
                      className="w-12.5 h-12.5 overflow-hidden rounded-xl flex items-center justify-center object-cover"
                      src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                      alt="用户头像"
                    />
                  </div>
                )
              : (
                  <div
                    className="w-12.5 h-12.5 bg-[#cfddf0] overflow-hidden border border-[#bfdbfe] rounded-xl flex items-center justify-center"
                  >
                    <img
                      src="/机器人头像.png"
                      alt="avatar"
                      className="w-auto h-8 object-cover rounded-full"
                    />
                  </div>
                )
          }
        </div>

        <div
          className={`w-0 flex flex-1 ${message.senderId !== 'system-bot-id' ? 'justify-end' : 'justify-start'}`}
        >
          <div
            className={
              `mb-2 max-w-[70%] ${
                message.senderId !== 'system-bot-id'
                  ? 'origin-bottom-right rounded-s-2xl rounded-b-2xl bg-[#2563EB] text-white'
                  : 'origin-bottom-left rounded-2xl bg-white'
              } animate-[popIn_0.4s_cubic-bezier(0.175,0.885,0.32,1.075)_forwards]  min-h-12.5 flex justify-start items-center`
            }
          >
            {
              getComponent(message)
            }
          </div>
        </div>
      </div>
    </>
  )
}

export default MessageComponent
