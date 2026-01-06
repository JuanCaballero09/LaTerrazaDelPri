import api from './axios'

// Orders API
export const getOrders = (email = null) => {
  return api.get('/orders', email ? { params: { email } } : {});
};

export const getOrder = (code, email = null) => {
  return api.get(`/orders/${code}`, email ? { params: { email } } : {});
};

export const createOrder = (orderData) => {
  return api.post('/orders', orderData);
};

export const updateOrderAddress = (code, address) => {
  return api.patch(`/orders/${code}/update_address`, { direccion: address });
};

// Payments API
export const createPayment = (orderCode, paymentData) => {
  return api.post(`/orders/${orderCode}/payments`, { payment: paymentData });
};

export const getPaymentStatus = (orderCode) => {
  return api.get(`/orders/${orderCode}/payments/status`);
};

export const cancelPayment = (orderCode) => {
  return api.post(`/orders/${orderCode}/payments/cancel`);
};
