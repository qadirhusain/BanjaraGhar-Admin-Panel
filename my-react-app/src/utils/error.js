// Turns an axios error into one message for a toast or a form
export function getErrorMessage(error) {
  const data = error.response?.data
  if (data?.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
    return Object.values(data.fieldErrors).join(', ')
  }
  if (data?.message) return data.message
  if (error.response) return 'Something went wrong. Please try again.'
  if (error.request) return 'Cannot reach the server. Is the backend running?'
  return error.message || 'Something went wrong'
}