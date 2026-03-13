// import type { Message } from '@/components/WorkFlow/store'
import * as React from 'react'

const Text: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div
      className="px-5 py-3 wrap-break-word w-auto text-[18px] min-h-12.5 flex justify-start items-center"
      // style={{
      //   lineHeight: 'normal',
      // }}
    >
      {/* error 的情况是服务无法正确的分析内容 */}
      {content || '我似乎不太理解你的意思。'}
    </div>
  )
}

export default Text
