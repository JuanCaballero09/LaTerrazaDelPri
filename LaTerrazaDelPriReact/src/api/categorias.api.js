import api from './axios'

export const getCategorias = () => api.get('/categorias')
export const getCategoria = (id) => api.get(`/categorias/${id}`)