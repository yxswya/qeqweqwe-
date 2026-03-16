import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { router } from './router.tsx'
import './assets/main.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />,
)
