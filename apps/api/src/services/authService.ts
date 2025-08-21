import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  User, 
  CreateUserRequest, 
  LoginRequest, 
  AuthResponse, 
  ValidationError, 
  UnauthorizedError, 
  ConflictError,
  validateEmail,
  validatePassword,
  generateId
} from '@cashback/shared';
import { db } from '../server';

export class AuthService {
  async register(userData: CreateUserRequest): Promise<AuthResponse> {
    const { email, password, regionId } = userData;

    // Validate input
    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!validatePassword(password)) {
      throw new ValidationError('Password must be at least 8 characters with uppercase, lowercase, and number');
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new ConflictError('User already exists');
    }

    // Check if region exists
    const region = await db.query(
      'SELECT id FROM regions WHERE id = $1',
      [regionId]
    );

    if (region.rows.length === 0) {
      throw new ValidationError('Invalid region');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const result = await db.query(
      `INSERT INTO users (email, password_hash, region_id) 
       VALUES ($1, $2, $3) 
       RETURNING id, email, region_id, wallet_balance, created_at`,
      [email, passwordHash, regionId]
    );

    const user = result.rows[0];
    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        regionId: user.region_id,
        walletBalance: parseFloat(user.wallet_balance),
        createdAt: user.created_at,
        updatedAt: user.created_at,
      } as Omit<User, 'passwordHash'>
    };
  }

  async login(loginData: LoginRequest): Promise<AuthResponse> {
    const { email, password } = loginData;

    if (!validateEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Find user
    const result = await db.query(
      'SELECT id, email, password_hash, region_id, wallet_balance, created_at, updated_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = this.generateToken(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        regionId: user.region_id,
        walletBalance: parseFloat(user.wallet_balance),
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      } as Omit<User, 'passwordHash'>
    };
  }

  private generateToken(userId: string): string {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );
  }
}