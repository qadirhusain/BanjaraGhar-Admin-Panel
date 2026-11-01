import api from './axiosClient'

export const getReviews = ({ visible, page, size = 20 }) =>
  api
    .get('/api/admin/reviews', { params: { visible: visible || undefined, page, size } })
    .then((res) => res.data)

export const setReviewVisible = (id, visible) =>
  api.patch(`/api/admin/reviews/${id}/visible`, { visible }).then((res) => res.data)