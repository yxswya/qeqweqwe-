import type * as React from 'react'
import { Link } from 'react-router'
import useStore from '../../store'

interface TrainJSON {
  answer: {
    train: {
      artifacts: {
        ckpt_id: string
        ckpt_uri: string
        mlflow_run: string
      }
    }
  }
}

const Products: React.FC = () => {
  const messages = useStore(state => state.messages)

  const rags = messages.reduce((pre, next) => {
    pre.push(...(next?.rags || []))
    return pre
  }, [] as any[])

  const trains = messages.reduce((pre, next) => {
    pre.push(...((next?.trains || []).map(el => JSON.parse(el.content) as TrainJSON)))
    return pre
  }, [] as TrainJSON[])

  console.log(trains)

  return (
    <div>
      <div className="space-y-1.5">
        {rags?.map((el, index) => (
          <Link
            key={el.id}
            to={`/app/rag-answer/${el.indexVersion}`}
            className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-blue-50 group transition-colors duration-150"
          >
            <span className="shrink-0 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors">
              {index + 1}
            </span>
            <span className="text-[15px] font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
              {el.indexVersion}
            </span>
            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}

        {trains?.map((el, index) => (
          <Link
            key={el.answer.train.artifacts.ckpt_id}
            to={`/app/train-answer/${el.answer.train.artifacts.ckpt_id}`}
            className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-blue-50 group transition-colors duration-150"
          >
            <span className="shrink-0 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-blue-500 rounded-full group-hover:bg-blue-600 transition-colors">
              {index + 1}
            </span>
            <span className="text-[15px] font-medium text-gray-700 group-hover:text-blue-700 transition-colors">
              {el.answer.train.artifacts.ckpt_uri}
            </span>
            <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-blue-500 ml-auto transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default Products
