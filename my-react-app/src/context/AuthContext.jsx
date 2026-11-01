import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { authApi } from '@/api/authApi'
import { tokenStorage } from '@/utils/tokenStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => tokenStorage.getUser())

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password)

    if (data.role !== 'ADMIN') {
      // A customer account: close the session we just opened and refuse
      authApi.logout(data.refreshToken).catch(() => {})
      throw new Error('This account does not have admin access')
    }

    tokenStorage.save(data)
    setUser(tokenStorage.getUser())
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefresh()
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken)
      } catch {
        // the local session is cleared either way
      }
    }
    tokenStorage.clear()
    setUser(null)
  }, [])

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}