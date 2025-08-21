import { User, NotFoundError, ValidationError } from '@cashback/shared';
import { db } from '../server';

export class UserService {
  async getUserById(userId: string): Promise<Omit<User, 'passwordHash'>> {
    const result = await db.query(
      'SELECT id, email, region_id, wallet_balance, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('User not found');
    }

    const user = result.rows[0];
    return {
      id: user.id,
      email: user.email,
      regionId: user.region_id,
      walletBalance: parseFloat(user.wallet_balance),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    } as Omit<User, 'passwordHash'>;
  }

  async updateWalletBalance(userId: string, amount: number): Promise<number> {
    if (amount === 0) {
      throw new ValidationError('Amount cannot be zero');
    }

    return await db.transaction(async (query) => {
      // Get current balance
      const userResult = await query(
        'SELECT wallet_balance FROM users WHERE id = $1',
        [userId]
      );

      if (userResult.rows.length === 0) {
        throw new NotFoundError('User not found');
      }

      const currentBalance = parseFloat(userResult.rows[0].wallet_balance);
      const newBalance = currentBalance + amount;

      if (newBalance < 0) {
        throw new ValidationError('Insufficient balance');
      }

      // Update balance
      await query(
        'UPDATE users SET wallet_balance = $1 WHERE id = $2',
        [newBalance, userId]
      );

      return newBalance;
    });
  }

  async getUsersByRegion(regionId: string, page: number = 1, limit: number = 20): Promise<{
    users: Omit<User, 'passwordHash'>[];
    total: number;
  }> {
    const offset = (page - 1) * limit;

    const [usersResult, countResult] = await Promise.all([
      db.query(
        `SELECT id, email, region_id, wallet_balance, created_at, updated_at 
         FROM users 
         WHERE region_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [regionId, limit, offset]
      ),
      db.query(
        'SELECT COUNT(*) FROM users WHERE region_id = $1',
        [regionId]
      )
    ]);

    const users = usersResult.rows.map((user: any) => ({
      id: user.id,
      email: user.email,
      regionId: user.region_id,
      walletBalance: parseFloat(user.wallet_balance),
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    })) as Omit<User, 'passwordHash'>[];

    return {
      users,
      total: parseInt(countResult.rows[0].count)
    };
  }
}