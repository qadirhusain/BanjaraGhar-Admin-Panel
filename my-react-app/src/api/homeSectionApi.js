import api from './axiosClient'

export const getHomeSections = () => api.get('/api/admin/home-sections').then((res) => res.data)

export const createHomeSection = (payload) =>
  api.post('/api/admin/home-sections', payload).then((res) => res.data)

export const updateHomeSection = (id, payload) =>
  api.put(`/api/admin/home-sections/${id}`, payload).then((res) => res.data)

export const setHomeSectionActive = (id, active) =>
  api.patch(`/api/admin/home-sections/${id}/active`, { active }).then((res) => res.data)

export const setHomeSectionProducts = (id, productIds) =>
  api.put(`/api/admin/home-sections/${id}/products`, { productIds }).then((res) => res.data)

export const deleteHomeSection = (id) => api.delete(`/api/admin/home-sections/${id}`)

// Picker list for choosing section products (the store has fewer than 50 products)
export const getAllProducts = () =>
  api
    .get('/api/admin/products', { params: { page: 0, size: 50 } })
    .then((res) => res.data.content)