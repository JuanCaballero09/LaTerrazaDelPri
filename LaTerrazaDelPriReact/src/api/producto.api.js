import api from "./axios";

export const getProductos = () => api.get(`/productos`);
export const getProducto = (categoriaId, id) => api.get(`/categorias/${categoriaId}/productos/${id}`);

