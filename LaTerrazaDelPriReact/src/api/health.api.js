import api from './axios'

export const healthCheck = () => api.get('/health')
