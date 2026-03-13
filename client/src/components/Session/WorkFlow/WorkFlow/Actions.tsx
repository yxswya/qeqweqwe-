import type * as React from 'react'
import { useStore } from '@/components/Session/store'

const Actions: React.FC = () => {
  const actions = useStore(state => state.actions)
  return (
    <div>
      {
        actions.map((action) => {
          return (
            <button
              key={action}
              className={` mt-2
            w-full py-3 rounded-lg transition-all duration-200 font-semibold
            flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm hover:shadow cursor-pointer
    
          `}
            >
              {action}
            </button>
          )
        })
      }

    </div>
  )
}

export default Actions
