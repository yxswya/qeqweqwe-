import type { UserInfo } from '@/api'
import { useRouteLoaderData } from 'react-router'

export interface AppLoaderData {
  user: UserInfo
}

export default function Settings() {
  const data = useRouteLoaderData('app') as AppLoaderData
  console.log('loader data:', data)
  return <h2>Settings（需要登录）</h2>
}
