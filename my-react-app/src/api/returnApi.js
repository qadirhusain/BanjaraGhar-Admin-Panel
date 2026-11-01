import api from '@/api/axiosClient'

const base = '/api/admin/returns'

export const returnApi = {
  list: ({ status, page, size }) =>
    api.get(base, { params: { status: status || undefined, page, size } }).then((res) => res.data),
  approve: (id, body) => api.post(`${base}/${id}/approve`, body).then((res) => res.data),
  reject: (id, body) => api.post(`${base}/${id}/reject`, body).then((res) => res.data),
}