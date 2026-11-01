// The backend sends uploaded images as "/uploads/..."; this adds the server address
export function imageUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${import.meta.env.VITE_API_BASE_URL}${path}`
}