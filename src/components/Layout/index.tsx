import { Outlet, useLocation } from 'react-router-dom'
import { useAppStore } from '../../stores'
import { useEffect } from 'react'
import './index.less'

const Layout = () => {
  const location = useLocation()
  const { setCurrentPage } = useAppStore()

  useEffect(() => {
    setCurrentPage(location.pathname)
  }, [location.pathname, setCurrentPage])

  return (
    <div className="container-mobile relative">
      <div className="h-screen flex flex-col">
        {/* 主内容区域 */}
        <div className="flex-1 overflow-y-auto pb-20">
          <Outlet />
        </div>
        
        {/* 底部导航栏 */}
        {/* <div className="bottom-0 left-0 right-0 z-50">
          <div className="max-w-md mx-auto bg-white">
            <TabBar
              activeKey={location.pathname}
              onChange={(key) => navigate(key)}
              className="h-16"
            >
              {tabs.map(item => (
                <TabBar.Item 
                  key={item.key} 
                  icon={item.icon} 
                  title={item.title} 
                />
              ))}
            </TabBar>
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default Layout