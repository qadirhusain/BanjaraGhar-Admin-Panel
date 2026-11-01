import api from './axiosClient'

export const getMessages = ({ status, page, size = 20 }) =>
  api
    .get('/api/admin/messages', { params: { status: status || undefined, page, size } })
    .then((res) => res.data)

export const setMessageStatus = (id, status) =>
  api.patch(`/api/admin/messages/${id}/status`, { status }).then((res) => res.data)