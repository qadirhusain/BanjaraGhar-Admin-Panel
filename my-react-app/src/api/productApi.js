import api from '@/api/axiosClient'

const base = '/api/admin/products'

export const productApi = {
  list: (page, size) => api.get(base, { params: { page, size } }).then((res) => res.data),
  get: (id) => api.get(`${base}/${id}`).then((res) => res.data),
  create: (body) => api.post(base, body).then((res) => res.data),
  update: (id, body) => api.put(`${base}/${id}`, body).then((res) => res.data),

  setActive: (id, active) => api.patch(`${base}/${id}/active`, { active }).then((res) => res.data),
  setFeatured: (id, featured) =>
    api.patch(`${base}/${id}/featured`, { featured }).then((res) => res.data),
  setStock: (id, quantity) => api.patch(`${base}/${id}/stock`, { quantity }).then((res) => res.data),
  setRelated: (id, productIds) =>
    api.put(`${base}/${id}/related`, { productIds }).then((res) => res.data),

  uploadImage(id, file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post(`${base}/${id}/images`, formData).then((res) => res.data)
  },
  reorderImages: (id, imageIds) =>
    api.put(`${base}/${id}/images/order`, { imageIds }).then((res) => res.data),
  deleteImage: (id, imageId) => api.delete(`${base}/${id}/images/${imageId}`),
}