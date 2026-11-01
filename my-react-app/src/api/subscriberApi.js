import api from './axiosClient'

export const getSubscribers = ({ active, page, size = 50 }) =>
  api
    .get('/api/admin/newsletter/subscribers', {
      params: { active: active || undefined, page, size },
    })
    .then((res) => res.data)

export const setSubscriberActive = (id, active) =>
  api.patch(`/api/admin/newsletter/subscribers/${id}/active`, { active }).then((res) => res.data)