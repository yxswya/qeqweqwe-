import type * as React from 'react'
import type { App } from '../../../../server/src/index'
import { treaty } from '@elysiajs/eden'
// import type { RagBuildParams } from '../Chat/types'
import { useRef } from 'react'
import { useStore } from '@/components/WorkFlow/store'

const app = treaty<App>('localhost:3000')

const RagSimple: React.FC = () => {
  const { sessionId, fetchRagBuild } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)

  const ragBuild = async () => {
    // const response = await fetch(`http://localhost:3000/api/conversations/${sessionId}/rag/build`, {
    //   method: 'POST',
    //   credentials: 'include',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ participantIds: [], title: `会话${Date.now()}` }),
    // })
    //   .then(res => res.json())

    // console.log(response)

    // if (response.cached) {
    //   alert('重复构建')
    // }
    // else {
    //   fetchRagBuild()
    // }

    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0)
      return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(2)} ${sizes[i]}`
  }

  const submit = (files: FileList | null) => {
    if (!files || files.length === 0)
      return

    const fileArray = Array.from(files)
    const totalSize = fileArray.reduce((sum, file) => sum + file.size, 0)

    console.log('Selected files:', fileArray.map(f => f.name))
    console.log('Total size:', formatFileSize(totalSize))
  }

  return (
    <div className="px-4">
      <button
        onClick={() => ragBuild()}
        className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
      >
        Rag 构建
      </button>

      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => submit(e.target.files)} />
    </div>
  )
}

export default RagSimple
