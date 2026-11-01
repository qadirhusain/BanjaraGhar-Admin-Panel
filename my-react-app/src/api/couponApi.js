import api from './axiosClient';

export const getCoupons = () => api.get('/api/admin/coupons').then((res) => res.data);

export const createCoupon = (payload) =>
  api.post('/api/admin/coupons', payload).then((res) => res.data);

export const updateCoupon = (id, payload) =>
  api.put(`/api/admin/coupons/${id}`, payload).then((res) => res.data);

export const setCouponActive = (id, active) =>
  api.patch(`/api/admin/coupons/${id}/active`, { active }).then((res) => res.data);

export const deleteCoupon = (id) => api.delete(`/api/admin/coupons/${id}`);