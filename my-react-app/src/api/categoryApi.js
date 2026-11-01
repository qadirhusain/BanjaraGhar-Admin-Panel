import api from '@/api/axiosClient'

export const categoryApi = {
  list: () => api.get('/api/admin/categories').then((res) => res.data),
  create: (body) => api.post('/api/admin/categories', body).then((res) => res.data),
  update: (id, body) => api.put(`/api/admin/categories/${id}`, body).then((res) => res.data),
  setActive: (id, active) =>
    api.patch(`/api/admin/categories/${id}/active`, { active }).then((res) => res.data),
}

export const uploadCategoryImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/api/admin/categories/image', formData).then((res) => res.data)
}