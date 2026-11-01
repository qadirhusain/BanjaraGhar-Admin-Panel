import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <div className="topbar__user">
        <span className="topbar__name">{user?.fullName}</span>
        <span className="topbar__email">{user?.email}</span>
      </div>
      <button type="button" className="btn btn--sm" onClick={handleLogout}>
        <LogOut size={16} />
        Logout
      </button>
    </header>
  )
}