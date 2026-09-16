import api from './api'

export const predictionService = {
  async generatePrediction(data) {
    const response = await api.post('/api/predictions/generate', data)
    return response.data
  },

  async getPredictions() {
    const response = await api.get('/api/predictions')
    return response.data
  },

  async getPredictionById(id) {
    const response = await api.get(`/api/predictions/${id}`)
    return response.data
  },

  async getForecasts() {
    const response = await api.get('/api/forecasts')
    return response.data
  },

  async generateForecast(data) {
    const response = await api.post('/api/forecasts/generate', data)
    return response.data
  }
}