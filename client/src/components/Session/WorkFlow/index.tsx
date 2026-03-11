import * as React from 'react'
import useStore from '@/components/Session/store'
import { Input, Questions, RagBuildList } from '@/components/WorkFlow'

const WorkFlow: React.FC = () => {
  const status = useStore(state => state.status)

  return (
    <div className="h-full flex flex-col">
      <RagBuildList />
      {status === 'loading' && <span>思考中...</span>}
      {status === 'input' && <Input />}
      {status === 'questions' && <Questions /> }
    </div>
  )
}

export default WorkFlow
