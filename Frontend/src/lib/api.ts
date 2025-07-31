import axios from 'axios';

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


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


appApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);


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
    formData.append('quantity', productData.stock_quantity.toString());
    formData.append('category_id', productData.category || '1');
    if (productData.image_url) {
      formData.append('imageFile', productData.image_url);
    }
    return api.post('/inventory/add', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: (id: string, productData: any) => {
    const formData = new FormData();
    formData.append('code', id);
    formData.append('name', productData.name);
    formData.append('price', productData.price.toString());
    formData.append('quantity', productData.stock_quantity.toString());
    formData.append('category_id', productData.category || '1');
    if (productData.image_url) {
      formData.append('imageFile', productData.image_url);
    }
    return api.put('/inventory/edit', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id: string) => api.delete(`/inventory/delete/${id}`),
  getCategories: () => api.get('/inventory/all/category'),
};


export const orderAPI = {
  getAll: () => api.get('/orders/getOrders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  create: (orderData: any) => api.post('/orders/add', orderData),
  update: (id: string, orderData: any) => api.put(`/orders/${id}`, orderData),
  delete: (id: string) => api.delete(`/orders/${id}`),
  updateStatus: (id: string, status: string) => {
    if (status === 'completed') {
      return api.post('/orders/complete', { orderId: id });
    } else if (status === 'cancelled') {
      return api.post('/orders/cancel', { order_id: id });
    }
    return Promise.reject(new Error('Invalid status'));
  },
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

export default api; 