import api from '@/api/axiosClient'

const base = '/api/admin/orders'

export const orderApi = {
  list: ({ status, q, page, size }) =>
    api
      .get(base, { params: { status: status || undefined, q: q || undefined, page, size } })
      .then((res) => res.data),
  get: (id) => api.get(`${base}/${id}`).then((res) => res.data),
  cancel: (id) => api.post(`${base}/${id}/cancel`).then((res) => res.data),

  getShipment: (id) => api.get(`${base}/${id}/shipment`).then((res) => res.data),
  retryShipment: (id) => api.post(`${base}/${id}/shipment/retry`).then((res) => res.data),
}