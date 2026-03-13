export const env = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL as string,
  APP_ENV: __APP_ENV__,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}

// 调试用
if (env.isDev) {
  console.table(env)
}
