import api from './axios';

// Obtener todas las órdenes (admin)
export const getAllOrdenes = (params = {}) => {
  return api.get('/ordenes', { params });
};

// Obtener una orden específica
export const getOrden = (id) => {
  return api.get(`/ordenes/${id}`);
};

// Crear una nueva orden
export const createOrden = (data) => {
  return api.post('/ordenes', data);
};

// Actualizar una orden
export const updateOrden = (id, data) => {
  return api.put(`/ordenes/${id}`, data);
};

// Actualizar solo el estado de una orden
export const updateOrdenEstado = (id, estado) => {
  return api.patch(`/ordenes/${id}/estado`, { estado });
};

// Cancelar una orden
export const cancelOrden = (id, motivo) => {
  return api.patch(`/ordenes/${id}/cancelar`, { motivo });
};

// Obtener órdenes del usuario actual
export const getMyOrdenes = () => {
  return api.get('/ordenes/mis-ordenes');
};

// Obtener estadísticas de órdenes
export const getOrdenesStats = () => {
  return api.get('/ordenes/stats');
};
