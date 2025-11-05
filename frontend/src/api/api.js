import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token a requests autenticados
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth
export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const getMe = (token) =>
  api.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` }
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

// Owner - Menu Management
export const getAllMenuItems = (params) =>
  api.get('/owner/menu-items', { params });

export const createMenuItem = (data) =>
  api.post('/owner/menu-items', data);

export const updateMenuItem = (id, data) =>
  api.put(`/owner/menu-items/${id}`, data);

export const toggleItemActive = (id) =>
  api.patch(`/owner/menu-items/${id}/toggle-active`);

export const updateItemStock = (id, data) =>
  api.patch(`/owner/menu-items/${id}/stock`, data);

export const deleteMenuItem = (id, permanent = false) =>
  api.delete(`/owner/menu-items/${id}`, { params: { permanent } });

// Owner - Analytics
export const getAnalyticsSummary = (range = '7d') =>
  api.get('/owner/analytics/summary', { params: { range } });

export const getAnalyticsTrends = (range = '7d') =>
  api.get('/owner/analytics/trends', { params: { range } });

// Kitchen
export const getKitchenOrdersNew = (status) =>
  api.get('/kitchen/orders', { params: { status } });

export const markItemReady = (orderId, itemId) =>
  api.patch(`/kitchen/orders/${orderId}/items/${itemId}/ready`);

export const markOrderReady = (orderId) =>
  api.patch(`/kitchen/orders/${orderId}/ready`);

// Waiter
export const getWaiterQueue = (status) =>
  api.get('/waiter/queue', { params: { status } });

export const markItemServed = (orderId, itemId) =>
  api.patch(`/waiter/orders/${orderId}/items/${itemId}/served`);

export const markOrderServed = (orderId) =>
  api.patch(`/waiter/orders/${orderId}/served`);

// Waiter - Open Tables
export const getOpenTables = () =>
  api.get('/waiter/open-tables');

export const getTableOrders = (tableId) =>
  api.get(`/waiter/table/${tableId}/orders`);

// Order - Add items
export const getOrderDetails = (orderId) =>
  api.get(`/order/${orderId}`);

export const addItemsToOrder = (orderId, items, requiresApproval = false) =>
  api.post(`/order/${orderId}/items`, { items, requiresApproval });

export default api;

