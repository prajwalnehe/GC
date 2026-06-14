import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('growwcode_user') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('growwcode_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;

// Auth
export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  forgotPassword: (data) => API.post('/auth/forgot-password', data),
  resetPassword: (token, data) => API.put(`/auth/reset-password/${token}`, data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

// Users
export const usersAPI = {
  getAll: () => API.get('/users'),
  getById: (id) => API.get(`/users/${id}`),
  create: (data) => API.post('/users', data),
  update: (id, data) => API.put(`/users/${id}`, data),
  delete: (id) => API.delete(`/users/${id}`),
};

// Leads
export const leadsAPI = {
  getAll: (params) => API.get('/leads', { params }),
  getById: (id) => API.get(`/leads/${id}`),
  create: (data) => API.post('/leads', data),
  update: (id, data) => API.put(`/leads/${id}`, data),
  delete: (id) => API.delete(`/leads/${id}`),
  addNote: (id, data) => API.post(`/leads/${id}/notes`, data),
  exportCSV: () => API.get('/leads/export', { responseType: 'blob' }),
};

// Follow-ups
export const followUpsAPI = {
  getAll: (params) => API.get('/follow-ups', { params }),
  getById: (id) => API.get(`/follow-ups/${id}`),
  create: (data) => API.post('/follow-ups', data),
  update: (id, data) => API.put(`/follow-ups/${id}`, data),
  delete: (id) => API.delete(`/follow-ups/${id}`),
};

// Proposals
export const proposalsAPI = {
  getAll: (params) => API.get('/proposals', { params }),
  getById: (id) => API.get(`/proposals/${id}`),
  create: (data) => API.post('/proposals', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  update: (id, data) => API.put(`/proposals/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => API.delete(`/proposals/${id}`),
};

// Clients
export const clientsAPI = {
  getAll: (params) => API.get('/clients', { params }),
  getById: (id) => API.get(`/clients/${id}`),
  create: (data) => API.post('/clients', data),
  update: (id, data) => API.put(`/clients/${id}`, data),
  delete: (id) => API.delete(`/clients/${id}`),
};

// Projects
export const projectsAPI = {
  getAll: (params) => API.get('/projects', { params }),
  getById: (id) => API.get(`/projects/${id}`),
  create: (data) => API.post('/projects', data),
  update: (id, data) => API.put(`/projects/${id}`, data),
  delete: (id) => API.delete(`/projects/${id}`),
};

// Payments
export const paymentsAPI = {
  getAll: (params) => API.get('/payments', { params }),
  getById: (id) => API.get(`/payments/${id}`),
  create: (data) => API.post('/payments', data),
  update: (id, data) => API.put(`/payments/${id}`, data),
  delete: (id) => API.delete(`/payments/${id}`),
};

// Documents
export const documentsAPI = {
  getAll: (params) => API.get('/documents', { params }),
  upload: (data) => API.post('/documents', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  delete: (id) => API.delete(`/documents/${id}`),
};

// Notifications
export const notificationsAPI = {
  getAll: () => API.get('/notifications'),
  markAsRead: (id) => API.put(`/notifications/${id}/read`),
  markAllAsRead: () => API.put('/notifications/read-all'),
};

// Dashboard
export const dashboardAPI = {
  getStats: () => API.get('/dashboard/stats'),
  getMonthlyLeads: () => API.get('/dashboard/monthly-leads'),
  getLeadSources: () => API.get('/dashboard/lead-sources'),
  getConversionRate: () => API.get('/dashboard/conversion-rate'),
  getRecentLeads: () => API.get('/dashboard/recent-leads'),
};
