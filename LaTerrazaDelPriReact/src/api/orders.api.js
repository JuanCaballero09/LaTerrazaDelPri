import api from './axios'

export const getOrders = () => api.get('/orders')
export const getOrder = code => api.get(`/orders/${code}`)
export const createOrder = data => api.post('/orders', data)
