import { createHashRouter, redirect } from 'react-router'
import { authApi } from '@/api'
import Forbidden from '@/pages/Forbidden'
import NotFound from '@/pages/NotFound'
import ServerError from '@/pages/ServerError'
import { clearTokens } from './auth'
import AppLayout, { appLoader } from './layouts/AppLayout'
import RootLayout from './layouts/RootLayout'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import LoginPage, {
  action as loginAction,
  loader as loginLoader,
} from './pages/Login'
import RagAnswer from './pages/RagAnswer'
import Settings from './pages/Settings'
import UserProfile from './pages/UserProfile'

export const router = createHashRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        loader: () => redirect('/app/dashboard'),
      },
      { path: 'home', element: <Home /> },

      {
        path: 'login',
        element: <LoginPage />,
        loader: loginLoader,
        action: loginAction,
      },

      // 退出登录用 action（不会渲染页面）
      {
        path: 'logout',
        action: async () => {
          try {
            await authApi.logout() // 通知后端
          }
          catch {
            // 忽略错误
          }
          clearTokens()
          throw redirect('/login')
        },
      },

      // 受保护区域：只要进 /app 先跑 loader
      {
        id: 'app',
        path: 'app',
        element: <AppLayout />,
        loader: appLoader,
        children: [
          { path: 'dashboard', element: <Dashboard /> },
          {
            path: 'dashboard/:id',
            element: <Dashboard />,
            loader: async ({ params }) => {
              const sessionId = params.id
              return {
                sessionId,
              }
            },
          },
          { path: 'settings', element: <Settings /> },
          { path: 'user-profile', element: <UserProfile /> },
          { path: 'rag-answer', element: <RagAnswer /> },
          { path: 'rag-answer/:id', element: <RagAnswer /> },
        ],
      },

      // 错误页面路由
      {
        path: '403',
        element: <Forbidden />,
      },
      {
        path: '500',
        element: <ServerError />,
      },

      // 404页面：通配符路由，放在最后
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])
