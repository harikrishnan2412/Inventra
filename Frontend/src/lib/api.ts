import axios from 'axios';
import { toast } from "@/components/ui/use-toast"; // 1. Import the toast function

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

const appApi = axios.create({
  baseURL: 'http://localhost:5000/app',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptors (no changes needed here)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

appApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- 2. UPDATED RESPONSE INTERCEPTORS ---

// This function will be the new error handler for both api instances
const handleResponseError = (error: any) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Redirect to the login page with a reason
    window.location.href = '/login?reason=session_expired'; 
  }
  return Promise.reject(error);
};

// Apply the new handler to both axios instances
api.interceptors.response.use(
  (response) => response,
  handleResponseError // Use the new handler
);

appApi.interceptors.response.use(
  (response) => response,
  handleResponseError // Use the new handler
);


// --- Rest of the file remains the same ---
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getProfile: () => api.get('/auth/me'),
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (userData: any) => api.post('/users', userData),
  update: (id: string, userData: any) => api.put(`/users/${id}`, userData),
  delete: (id: string) => api.delete(`/users/${id}`),
};

export const inventoryAPI = {
  getAll: () => api.get('/inventory/all'),
  getById: (id: string) => api.get(`/inventory/${id}`),
  create: (productData: any) => {
    const formData = new FormData();
    formData.append('name', productData.name);
    formData.append('price', productData.price.toString());
    formData.append('quantity', productData.quantity.toString());
    formData.append('category', productData.category || '1');
    if (productData.image_url) {
      formData.append('imageFile', productData.image_url);
    }
    return api.post('/inventory/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (code: string, productData: any) =>
    api.put(`/inventory/edit/${code}`, productData),
  delete: (code: string) => api.delete(`/inventory/delete/${code}`),
  getCategories: () => api.get('/inventory/all/category'),
};

export const orderAPI = {
  getAll: () => api.get('/orders/getOrders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (orderData: any) => api.post('/orders/add', orderData),
  update: (id: string, orderData: any) => api.put(`/orders/${id}`, orderData),
  delete: (id: string) => api.delete(`/orders/${id}`),
  markCompleted: (orderId: number) => api.put(`/orders/complete/${orderId}`),
  cancel: (data: { order_id: number }) => api.post('/orders/cancel', data), 
};

export const stockMonitorAPI = {
  getLowStock: () => appApi.get('/stockmonitor/low'),
  getOutOfStock: () => appApi.get('/stockmonitor/out-of-stock'),
  getStockAlerts: () => appApi.get('/stockmonitor/alerts'),
};

export const salesStatsAPI = {
  getStats: (period?: string) => appApi.get('/stats/total'),
  getRevenue: (period?: string) => appApi.get('/stats/revenue/week'),
  getTopProducts: () => appApi.get('/stats/top-products'),
  getSalesChart: (period?: string) => appApi.get('/stats/product/week'),
};

export const reportAPI = {
  generateReport: (type: string, filters?: any) =>
    api.post('/report/generate', { type, filters }),
  getReportHistory: () => api.get('/report/history'),
  downloadReport: (id: string) => api.get(`/report/download/${id}`),
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

export default api;