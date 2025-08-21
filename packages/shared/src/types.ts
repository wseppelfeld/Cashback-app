export interface User {
  id: string;
  email: string;
  passwordHash: string;
  regionId: string;
  walletBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Region {
  id: string;
  name: string;
  currency: string;
  cashbackRate: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Merchant {
  id: string;
  name: string;
  regionId: string;
  commissionRate: number;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  merchantId: string;
  amount: number;
  cashbackAmount: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletMovement {
  id: string;
  userId: string;
  transactionId?: string;
  type: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: Date;
}

export interface Settlement {
  id: string;
  merchantId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  settledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  regionId: string;
}

export interface CreateMerchantRequest {
  name: string;
  regionId: string;
  commissionRate: number;
}

export interface CreateTransactionRequest {
  userId: string;
  merchantId: string;
  amount: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, 'passwordHash'>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}