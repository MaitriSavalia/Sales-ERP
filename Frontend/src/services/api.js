import axios from 'axios';

const API_URL = 'http://localhost:5261/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
  updateCommissionStatus: (id, data) => api.put(`/admin/sales/${id}/commission-status`, data),
  updateSaleStatus: (id, data) => api.put(`/admin/sales/${id}/sale-status`, data),
  getMyPartners: () => api.get('/admin/partners'),
  addPartner: (data) => api.post('/admin/partners', data),
  removePartner: (partnerId) => api.delete(`/admin/partners/${partnerId}`),
  getTopPartners: () => api.get('/admin/top-partners'),
};

// Partner Service
export const partnerService = {
  getDashboard: () => api.get('/partner/dashboard'),
  getProducts: () => api.get('/partner/products'),
  getBuyers: () => api.get('/partner/buyers'),
  getSales: () => api.get('/partner/sales'),
  createSale: (data) => api.post('/partner/sales', data),
};

export default api;