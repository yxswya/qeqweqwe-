import type * as React from 'react'
import { useRef } from 'react'

const TrainCore: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleTrainGovernance = async () => {
    if (inputRef.current) {
      inputRef.current.click()
    }
  }

  const submit = (files: FileList | null) => {
    if (!files || files.length === 0)
      return

    const fileArray = [...files]
    const formData = new FormData()
    for (let i = 0; i < fileArray.length; i++) {
      formData.append('files', fileArray[i])
    }

    fetch(`${import.meta.env.VITE_API_BASE_URL}/train/start`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
  }

  return (
    <div>
      <span className="text-blue-700 underline cursor-pointer" onClick={() => handleTrainGovernance()}>治理 + RAG + 训练</span>
      <input ref={inputRef} type="file" multiple style={{ display: 'none' }} onChange={e => submit(e.target.files)} />
    </div>
  )
}

export default TrainCore
