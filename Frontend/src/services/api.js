import axios from 'axios';

const API_URL = 'http://localhost:5261/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const tabId = sessionStorage.getItem('tabId');
    const token = sessionStorage.getItem(`token_${tabId}`);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

// Admin Service
export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getProducts: () => api.get('/admin/products'),
  createProduct: (data) => api.post('/admin/products', data),
  updateProduct: (id, data) => api.put(`/admin/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),
  getSales: () => api.get('/admin/sales'),
  updateSaleStatus: (id, data) => api.put(`/admin/sales/${id}/status`, data),
  
  // Partner Management
  getMyPartners: () => api.get('/admin/my-partners'),
  addPartner: (data) => api.post('/admin/add-partner', data),
  removePartner: (partnerId) => api.delete(`/admin/remove-partner/${partnerId}`),
  searchPartners: (email) => api.get('/admin/search-partners', { params: { email } }),
};

// Partner Service
export const partnerService = {
  getDashboard: () => api.get('/partner/dashboard'),
  getProducts: () => api.get('/partner/products'),
  getBuyers: () => api.get('/partner/buyers'),
  searchBuyers: (email) => api.get('/partner/buyers/search', { params: { email } }),
  canSellToBuyer: (productId, buyerId) => api.get(`/partner/products/${productId}/can-sell/${buyerId}`),
  getSales: () => api.get('/partner/sales'),
  createSale: (data) => api.post('/partner/sales', data),
  getMyAdmins: () => api.get('/partner/my-admins'),
};

export default api;