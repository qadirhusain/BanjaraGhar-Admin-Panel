import api from '@/api/axiosClient'

export const authApi = {
  login: (email, password) =>
    api.post('/api/auth/login', { email, password }).then((res) => res.data),

  logout: (refreshToken) => api.post('/api/auth/logout', { refreshToken }),
}