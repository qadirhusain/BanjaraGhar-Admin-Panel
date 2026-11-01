import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Topbar from '@/components/layout/Topbar'
import '@/components/layout/layout.css'

export default function AdminLayout() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-layout__main">
        <Topbar />
        <main className="admin-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}