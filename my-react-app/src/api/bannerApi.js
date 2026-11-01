import api from './axiosClient'

export const getBanners = (placement) =>
  api.get('/api/admin/banners', { params: placement ? { placement } : {} }).then((res) => res.data)

export const uploadBannerImage = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('/api/admin/banners/image', formData).then((res) => res.data)
}

export const createBanner = (payload) =>
  api.post('/api/admin/banners', payload).then((res) => res.data)

export const updateBanner = (id, payload) =>
  api.put(`/api/admin/banners/${id}`, payload).then((res) => res.data)

export const setBannerActive = (id, active) =>
  api.patch(`/api/admin/banners/${id}/active`, { active }).then((res) => res.data)

export const deleteBanner = (id) => api.delete(`/api/admin/banners/${id}`)

export const getCategories = () => api.get('/api/admin/categories').then((res) => res.data)