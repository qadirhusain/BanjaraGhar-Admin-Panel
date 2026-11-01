import api from '@/api/axiosClient'

export const dashboardApi = {
  get: () => api.get('/api/admin/dashboard').then((res) => res.data),
}