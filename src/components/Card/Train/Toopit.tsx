import type * as React from 'react'
import type { ModelRecommendResponse } from '@/components/Session/types/model.ts'
import type { Message } from '@/components/Session/types'
import { Loader2Icon } from 'lucide-react'
import { useState } from 'react'
import Modal from '@/components/Model'
import './Toopit.css'

const TrainToopit: React.FC<{ message: Message }> = ({ message }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<ModelRecommendResponse>()

  const openModelSelect = () => {
    setIsModalOpen(true)
    setLoading(true)
    console.log(JSON.parse(message.content))
    fetch('http://localhost:3002/api/v1/model/recommend', {
      method: 'GET',
      credentials: 'include',
    }).then(res => res.json()).then((modelRecRes: ModelRecommendResponse) => {
      setData(modelRecRes)
    }).finally(() => {
      setLoading(false)
    })
  }

  const trainEvaluate = () => {
    fetch('http://localhost:3002/api/v1/train/evaluate', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(res => res.json()).then((data) => {
      console.log(data)
    })
  }

  const trainModel = (model_id: string) => {
    fetch('http://localhost:3002/api/v1/train/start', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model_id,
      }),
    }).then(res => res.json()).then((data) => {
      console.log(data)
    })
  }

  return (
    <div className="px-5 pb-3 wrap-break-word w-auto text-[18px] min-h-12.5 flex justify-end items-center gap-2">
      <span className="underline text-blue-600 font-bold cursor-pointer" onClick={() => openModelSelect()}>补充训练参数</span>
      <span className="underline text-blue-600 font-bold cursor-pointer" onClick={() => trainEvaluate()}>训练评估/仅估算指标</span>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="markdown-body w-260 h-200 relative">
          <div className="mb-4">
            <h2 className="font-bold text-lg">用户需求:</h2>
            <div className="pl-5 pt-5">
              {data?.answer.user_request}
            </div>
          </div>
          <div className="mb-4">
            <h2 className="font-bold text-lg">推荐模型（排序已综合热度/更新/匹配/许可/资源）</h2>

            <div className="flex flex-col gap-2 cursor-pointer pl-5 pt-5">
              {
                data?.answer.recommendations.map((model) => {
                  return (
                    <div
                      onClick={() => {
                        trainModel(model.model_id)
                      }}
                      key={model.model_id}
                      className="bg-gray-50 hover:bg-gray-100 p-6 rounded-xl duration-150"
                    >
                      <h3>{model.model_id}</h3>
                      <ul className="flex flex-col gap-1">
                        <li>
                          <span>推荐理由: </span>
                          <span>{model.why}</span>
                        </li>
                        <li>
                          <span>风险提示:</span>
                          <span>{model.risk}</span>
                        </li>
                        <li>
                          <span>链接:</span>
                          <a className="text-blue-600 hover:text-blue-700" target="_black" href={`https://huggingface.co/${model.model_id}`}>
                            {`https://huggingface.co/${model.model_id}`}
                          </a>
                        </li>
                      </ul>

                    </div>
                  )
                })
              }
            </div>
          </div>
          <div className="mb-4">
            <h2 className="font-bold text-lg">备选模型（可进一步评估）</h2>
            <div className="pt-5 pl-5">
              {data?.sources.map((el) => {
                return (
                  <ul key={el}>
                    <li>
                      <a className="text-blue-600 hover:text-blue-700" target="_black" href={`${el}`}>{el}</a>
                    </li>
                  </ul>
                )
              })}
            </div>
          </div>

          {loading && (
            <div className="w-full h-full absolute top-0 left-0 bg-white flex justify-center items-center">
              <Loader2Icon size={50} className="animate-spin" />
            </div>
          ) }

        </div>
      </Modal>
    </div>
  )
}

export default TrainToopit
