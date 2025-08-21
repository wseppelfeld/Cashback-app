import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (email: string, password: string, regionId: string) => {
    const response = await apiClient.post('/auth/register', { email, password, regionId });
    return response.data;
  },
};

export const merchantService = {
  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get(`/merchants?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/merchants/${id}`);
    return response.data;
  },

  create: async (data: { name: string; regionId: string; commissionRate: number }) => {
    const response = await apiClient.post('/merchants', data);
    return response.data;
  },

  updateStatus: async (id: string, status: string) => {
    const response = await apiClient.patch(`/merchants/${id}/status`, { status });
    return response.data;
  },
};

export const regionService = {
  getAll: async () => {
    const response = await apiClient.get('/regions');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/regions/${id}`);
    return response.data;
  },
};

export const transactionService = {
  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get(`/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (data: { merchantId: string; amount: number }) => {
    const response = await apiClient.post('/transactions', data);
    return response.data;
  },
};

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },
};