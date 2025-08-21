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
  // In React Native, you'd use AsyncStorage instead of localStorage
  // For now, we'll use a simple token storage mechanism
  const token = global.authToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

export const userService = {
  getProfile: async () => {
    const response = await apiClient.get('/users/profile');
    return response.data;
  },
};

export const transactionService = {
  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get(`/transactions?page=${page}&limit=${limit}`);
    return response.data;
  },

  create: async (data: { merchantId: string; amount: number }) => {
    const response = await apiClient.post('/transactions', data);
    return response.data;
  },
};

export const walletService = {
  getWallet: async () => {
    const response = await apiClient.get('/wallet');
    return response.data;
  },

  getMovements: async (page = 1, limit = 20) => {
    const response = await apiClient.get(`/wallet/movements?page=${page}&limit=${limit}`);
    return response.data;
  },

  redeem: async (amount: number, description: string) => {
    const response = await apiClient.post('/wallet/redeem', { amount, description });
    return response.data;
  },
};

export const merchantService = {
  getAll: async (page = 1, limit = 20) => {
    const response = await apiClient.get(`/merchants?page=${page}&limit=${limit}`);
    return response.data;
  },
};

export const regionService = {
  getAll: async () => {
    const response = await apiClient.get('/regions');
    return response.data;
  },
};