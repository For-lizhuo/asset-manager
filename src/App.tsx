import { RouterProvider } from 'react-router-dom'
import { ConfigProvider } from 'antd-mobile'
import { router } from './router'
import zhCN from 'antd-mobile/es/locales/zh-CN'
import { useAppStore } from './stores/useAppStore'
import { useEffect } from 'react'
import './index.css'

function App() {
  const { initializeApp } = useAppStore()
  
  useEffect(() => {
    // 应用启动时初始化数据库
    initializeApp()
  }, [initializeApp])
  
  return (
    <ConfigProvider locale={zhCN}>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

export default App
