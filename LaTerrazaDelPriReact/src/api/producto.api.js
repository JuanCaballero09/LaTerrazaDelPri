import api from "./axios";

export const getProductos = () => api.get(`/productos`);
export const getProducto = (categoriaId, id) => api.get(`/categorias/${categoriaId}/productos/${id}`);

// Admin CRUD operations
export const getAllProductos = () => api.get(`/productos`);
export const createProducto = (data) => api.post(`/productos`, data);
export const updateProducto = (id, data) => api.put(`/productos/${id}`, data);
export const deleteProducto = (id) => api.delete(`/productos/${id}`);


