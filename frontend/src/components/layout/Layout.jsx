import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import ChatWidget from '../common/ChatWidget'

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-[#080c14] text-slate-100 antialiased font-sans">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden bg-[#080c14]">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#080c14]">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}

export default Layout