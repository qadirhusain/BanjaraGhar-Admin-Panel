const ACCESS_KEY = 'bg_admin_access'
const REFRESH_KEY = 'bg_admin_refresh'
const USER_KEY = 'bg_admin_user'

export const tokenStorage = {
  getAccess: () => localStorage.getItem(ACCESS_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),

  getUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY))
    } catch {
      return null
    }
  },

  // data is the AuthResponse sent by /api/auth/login and /api/auth/refresh
  save(data) {
    localStorage.setItem(ACCESS_KEY, data.accessToken)
    localStorage.setItem(REFRESH_KEY, data.refreshToken)
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({
        id: data.userId,
        email: data.email,
        fullName: data.fullName,
        role: data.role,
      }),
    )
  },

  clear() {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
    localStorage.removeItem(USER_KEY)
  },
}