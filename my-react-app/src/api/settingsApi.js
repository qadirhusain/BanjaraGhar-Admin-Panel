import api from './axiosClient'

export const getShippingSettings = () =>
  api.get('/api/admin/settings/shipping').then((res) => res.data);

export const updateShippingSettings = (payload) =>
  api.put('/api/admin/settings/shipping', payload).then((res) => res.data);