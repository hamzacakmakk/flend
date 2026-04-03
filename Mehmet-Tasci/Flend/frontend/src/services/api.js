import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Integration API
// ============================================

export const integrationAPI = {
  getAll: () => api.get('/integrations'),
  create: (data) => api.post('/integrations', data),
  update: (id, data) => api.put(`/integrations/${id}`, data),
  delete: (id) => api.delete(`/integrations/${id}`),
  syncProducts: (id) => api.post(`/integrations/${id}/sync`),
};

// ============================================
// Product API
// ============================================

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  updateMinPrice: (id, min_price) => api.put(`/products/${id}/min-price`, { min_price }),
  delete: (id) => api.delete(`/products/${id}`),
};



export default api;
