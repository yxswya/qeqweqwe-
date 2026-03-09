import type * as React from 'react'
import { useStore } from '@/components/WorkFlow/store'
// import type { RagBuildParams } from '../Chat/types'
// import { useRef } from 'react'

const RagSimple: React.FC = () => {
  const { sessionId, fetchRagBuild } = useStore()
//   const inputRef = useRef<HTMLInputElement>(null)

  const ragBuild = async () => {
    const response = await fetch(`http://localhost:3000/api/conversations/${sessionId}/rag/build`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ participantIds: [], title: `会话${Date.now()}` }),
    })
      .then(res => res.json())

    console.log(response)

    if (response.cached) {
      alert("重复构建")
    } else {
      fetchRagBuild()
    }

    // if (inputRef.current) {
    //   inputRef.current.click()
    // }
  }

  //   const submit = (files: FileList) => {

  //   }

  return (
    <div className="px-4">
      <button
        onClick={() => ragBuild()}
        className="px-6 py-2.5 bg-linear-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
      >
        Rag 构建
      </button>

      {/* <input ref={inputRef} type="file" style={{ display: 'none' }} onChange={e => submit(e.target.files)} /> */}
    </div>
  )
}

export default RagSimple
