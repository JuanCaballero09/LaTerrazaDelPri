import api from './axios';

// Dashboard Stats
export const getDashboardStats = () => {
  return api.get('/dashboard/stats');
};

export const getRecentOrders = (limit = 10) => {
  return api.get('/dashboard/recent_orders', { params: { limit } });
};

// Products Dashboard
export const getDashboardProducts = (params = {}) => {
  return api.get('/dashboard/productos', { params });
};

export const getDashboardProduct = (id) => {
  return api.get(`/dashboard/productos/${id}`);
};

export const createDashboardProduct = (data) => {
  // Si data es FormData, enviarlo directamente; si no, envolverlo en { product: data }
  const isFormData = data instanceof FormData;
  return api.post('/dashboard/productos', isFormData ? data : { product: data }, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
};

export const updateDashboardProduct = (id, data) => {
  const isFormData = data instanceof FormData;
  return api.put(`/dashboard/productos/${id}`, isFormData ? data : { product: data }, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
};

export const deleteDashboardProduct = (id) => {
  return api.delete(`/dashboard/productos/${id}`);
};

export const toggleProductDisponibilidad = (id) => {
  return api.patch(`/dashboard/productos/${id}/toggle_disponibilidad`);
};

// Orders Dashboard
export const getDashboardOrders = (params = {}) => {
  return api.get('/dashboard/orders', { params });
};

export const getDashboardOrder = (code) => {
  return api.get(`/dashboard/orders/${code}`);
};

export const cambiarEstadoOrden = (code, status) => {
  return api.patch(`/dashboard/orders/${code}/cambiar_estado`, { status });
};

export const getOrdersStats = () => {
  return api.get('/dashboard/orders/stats');
};

export const getEmployeeOrders = () => {
  return api.get('/dashboard/orders/employee');
};

// Users Dashboard
export const getDashboardUsers = (params = {}) => {
  return api.get('/dashboard/users', { params });
};

export const getDashboardUser = (id) => {
  return api.get(`/dashboard/users/${id}`);
};

export const createDashboardUser = (data) => {
  return api.post('/dashboard/users', { user: data });
};

export const updateDashboardUser = (id, data) => {
  return api.put(`/dashboard/users/${id}`, { user: data });
};

export const deleteDashboardUser = (id) => {
  return api.delete(`/dashboard/users/${id}`);
};

export const toggleUserActivo = (id) => {
  return api.patch(`/dashboard/users/${id}/toggle_activo`);
};

// Sedes Dashboard
export const getDashboardSedes = (params = {}) => {
  return api.get('/dashboard/sedes', { params });
};

export const getDashboardSede = (id) => {
  return api.get(`/dashboard/sedes/${id}`);
};

export const createDashboardSede = (data) => {
  return api.post('/dashboard/sedes', { sede: data });
};

export const updateDashboardSede = (id, data) => {
  return api.put(`/dashboard/sedes/${id}`, { sede: data });
};

export const deleteDashboardSede = (id) => {
  return api.delete(`/dashboard/sedes/${id}`);
};

export const toggleSedeActivo = (id) => {
  return api.patch(`/dashboard/sedes/${id}/toggle_activo`);
};

// Grupos Dashboard (usa endpoint de categorias en backend)
export const getDashboardGrupos = () => {
  return api.get('/dashboard/categorias');
};

export const getDashboardGrupo = (id) => {
  return api.get(`/dashboard/categorias/${id}`);
};

export const createDashboardGrupo = (data) => {
  const isFormData = data instanceof FormData;
  return api.post('/dashboard/categorias', isFormData ? data : { grupo: data }, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
};

export const updateDashboardGrupo = (id, data) => {
  const isFormData = data instanceof FormData;
  return api.put(`/dashboard/categorias/${id}`, isFormData ? data : { grupo: data }, {
    headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
};

export const deleteDashboardGrupo = (id) => {
  return api.delete(`/dashboard/categorias/${id}`);
};

// Ingredientes Dashboard
export const getDashboardIngredientes = () => {
  return api.get('/dashboard/ingredientes');
};

export const getDashboardIngrediente = (id) => {
  return api.get(`/dashboard/ingredientes/${id}`);
};

export const createDashboardIngrediente = (data) => {
  return api.post('/dashboard/ingredientes', { ingrediente: data });
};

export const updateDashboardIngrediente = (id, data) => {
  return api.put(`/dashboard/ingredientes/${id}`, { ingrediente: data });
};

export const deleteDashboardIngrediente = (id) => {
  return api.delete(`/dashboard/ingredientes/${id}`);
};

// Banners Dashboard
export const getDashboardBanners = () => {
  return api.get('/dashboard/banners');
};

export const getDashboardBanner = (id) => {
  return api.get(`/dashboard/banners/${id}`);
};

export const createDashboardBanner = (data) => {
  // Si data es FormData, enviarlo directamente
  // Si no, wrappear en {banner: data}
  const payload = data instanceof FormData ? data : { banner: data };
  return api.post('/dashboard/banners', payload, {
    headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
};

export const updateDashboardBanner = (id, data) => {
  return api.put(`/dashboard/banners/${id}`, { banner: data });
};

export const deleteDashboardBanner = (id) => {
  return api.delete(`/dashboard/banners/${id}`);
};
