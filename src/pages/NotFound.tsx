import { Link } from 'react-router'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 py-12">
      <h1 className="text-8xl font-bold mb-4 text-gray-800">404</h1>
      <h2 className="text-2xl mb-6 text-gray-600">页面未找到</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        抱歉，您访问的页面不存在或已被移除。请检查您输入的URL是否正确，或返回首页。
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
      >
        返回首页
      </Link>
    </div>
  )
}
