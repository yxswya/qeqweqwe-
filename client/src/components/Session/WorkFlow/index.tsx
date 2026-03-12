import * as React from 'react'
import { useNavigate } from 'react-router'
import SS from './SS'

const WorkFlow: React.FC = () => {
  const [list, setList] = React.useState<Array<{ id: string, title: string }>>([])
  const navigate = useNavigate()

  React.useEffect(() => {
    fetch('http://localhost:3002/api/v1/session/chat', {
      credentials: 'include',
    }).then(res => res.json()).then((data) => {
      console.log(data)
      setList(data)
    })
  }, [])

  const jump = (sessionId: string) => {
    navigate(`/app/dashboard/${sessionId}`)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 h-0">
        <div className="flex bg-gray-200 items-center">
          <span>切换会话</span>
          <select name="" id="" onChange={e => jump(e.target.value)}>
            {list.map(el => <option key={el.id} value={el.id}>{el.title}</option>)}
          </select>
        </div>
      </div>
      <div className=" shrink-0">
        <SS />
      </div>
    </div>
  )
}

export default WorkFlow
