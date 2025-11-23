import axios from 'axios';

// Base URL for backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// -------------- AUTH API ------------------
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// -------------- PRODUCT API ------------------
export const productAPI = {
  getAll: () => api.get('/products'),
  getById: (id) => api.get(`/products/${id}`),
  search: (query) => api.get(`/products/search?q=${query}`),
};

// -------------- ORDER + PAYMENT API ------------------
export const orderAPI = {
  // Create new order
  createOrder: (orderData) => api.post('/orders', orderData),

  // Stripe Payment Intent
  createPaymentIntent: (orderId) => api.post(`/orders/${orderId}/paymentIntent`),

  // Hosted Stripe Checkout
  createCheckoutSession: (orderId) => api.post(`/orders/${orderId}/create-checkout-session`),
};

export default api;