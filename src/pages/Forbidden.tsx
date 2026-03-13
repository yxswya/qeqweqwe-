import { Link } from 'react-router'

export default function Forbidden() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 py-12">
      <h1 className="text-8xl font-bold mb-4 text-gray-800">403</h1>
      <h2 className="text-2xl mb-6 text-gray-600">权限不足</h2>
      <p className="text-gray-500 mb-8 max-w-md">
        抱歉，您没有权限访问此页面。请检查您的权限或联系管理员获取更多信息。
      </p>
      <div className="flex gap-4">
        <Link
          to="/"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          返回首页
        </Link>
        <Link
          to="/login"
          className="px-6 py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          重新登录
        </Link>
      </div>
    </div>
  )
}
