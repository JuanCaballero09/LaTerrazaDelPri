import api from "./axios";

export const getProducto = (categoriaId, id) => api.get(`/categorias/${categoriaId}/productos/${id}`);

export default { getProducto };
