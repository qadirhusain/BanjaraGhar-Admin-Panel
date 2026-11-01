import api from './axiosClient'

export const getActivityLog = ({ entityType, page, size = 50 }) =>
  api
    .get('/api/admin/activity-log', { params: { entityType: entityType || undefined, page, size } })
    .then((res) => res.data)