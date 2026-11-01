import api from '@/api/axiosClient'

export const uploadApi = {
  // Reuses the banner upload endpoint. It stores the file and returns { url }.
  uploadImage(file) {
    const formData = new FormData()
    formData.append('file', file)
    return api.post('/api/admin/banners/image', formData).then((res) => res.data)
  },
}