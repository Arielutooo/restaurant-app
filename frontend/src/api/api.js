import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Session
export const createSessionFromQR = (token, tableNumber) =>
  api.post('/session/from-qr', { token, tableNumber });

export const generateQR = (tableNumber) =>
  api.get(`/qr/generate/${tableNumber}`);

// Menu
export const getMenu = (category) =>
  api.get('/menu', { params: { category } });

export const getMenuItem = (id) =>
  api.get(`/menu/${id}`);

export const validateCart = (items) =>
  api.post('/cart/validate', { items });

// Orders
export const createOrder = (orderData) =>
  api.post('/order', orderData);

export const approveOrder = (orderId, waiterPin) =>
  api.post('/order/approve', { orderId, waiterPin });

export const updateOrderStatus = (orderId, status) =>
  api.put('/order/status', { orderId, status });

export const getKitchenOrders = () =>
  api.get('/kds/orders');

export const getPendingOrders = () =>
  api.get('/orders/pending');

// Payments
export const createPayment = (paymentData) =>
  api.post('/payment/create', paymentData);

export const confirmPayment = (paymentId, transactionId) =>
  api.post('/payment/confirm', { paymentId, transactionId });

export default api;

