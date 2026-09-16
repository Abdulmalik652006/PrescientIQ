import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  // Let the browser set multipart boundaries for FormData payloads.
  if (config.data instanceof FormData) {
    if (config.headers) {
      delete config.headers['Content-Type']
      delete config.headers['content-type']
    }
  } else {
    config.headers = {
      ...config.headers,
      'Content-Type': 'application/json',
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api