import api from './api'

export const authService = {
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password })
    return response.data
  },

  async register(userData) {
    const response = await api.post('/api/auth/register', userData)
    return response.data
  },

  async getMe() {
    const response = await api.get('/api/auth/me')
    return response.data
  },

  async logout() {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
  }
}