import type * as React from 'react'
import { useRef } from 'react'
import { server } from '@/api/modules/session'

interface TrainCoreProps {
  sessionId?: string
}

const TrainCore: React.FC<TrainCoreProps> = ({ sessionId }) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleTrainGovernance = async () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const submit = async (files: FileList | null) => {
    if (!files || files.length === 0)
      return

    const fileArray = [...files]

    try {
      // 构建 FormData 用于文件上传
      const formData = new FormData()
      fileArray.forEach((file) => {
        formData.append('files', file)
      })

      // 使用 fetch 直接发送 multipart/form-data
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/train/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`,
        },
        body: formData,
      })

      if (response.ok) {
        console.log('训练任务已启动')
      }
      else {
        console.error('启动训练失败:', response.status, await response.text())
      }
    }
    catch (error) {
      console.error('启动训练失败:', error)
    }
  }

  return (
    <div>
      <span className="text-blue-700 underline cursor-pointer" onClick={() => handleTrainGovernance()}>治理 + RAG + 训练</span>
      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => submit(e.target.files)} />
    </div>
  )
}

export default TrainCore
