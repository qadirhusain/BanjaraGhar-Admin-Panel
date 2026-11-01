import axios from 'axios'
import { tokenStorage } from '@/utils/tokenStorage'

const baseURL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({ baseURL })

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// If several calls fail with 401 together, they all wait for one refresh
let refreshPromise = null

async function refreshTokens() {
  const refreshToken = tokenStorage.getRefresh()
  if (!refreshToken) throw new Error('No refresh token')
  const { data } = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken })
  tokenStorage.save(data)
  return data.accessToken
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    const isAuthCall = original?.url?.includes('/api/auth/')

    if (error.response?.status === 401 && original && !original._retry && !isAuthCall) {
      original._retry = true
      try {
        refreshPromise =
          refreshPromise ||
          refreshTokens().finally(() => {
            refreshPromise = null
          })
        const newToken = await refreshPromise
        original.headers.Authorization = `Bearer ${newToken}`
        return api(original)
      } catch {
        tokenStorage.clear()
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export default api