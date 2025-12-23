import api from './axios'

export const getCategorias = () => api.get('/categorias')
export const getCategoria = (id) => api.get(`/categorias/${id}`)
export const getProductsByCategoria = (id) => api.get(`/categorias/${id}/productos`)