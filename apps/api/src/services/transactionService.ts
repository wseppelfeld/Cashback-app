import { 
  Transaction, 
  CreateTransactionRequest, 
  ValidationError, 
  NotFoundError,
  validateAmount,
  generateId 
} from '@cashback/shared';
import { db } from '../server';
import { EventEmitter } from './eventEmitter';

export class TransactionService {
  private eventEmitter = new EventEmitter();

  async createTransaction(transactionData: CreateTransactionRequest): Promise<Transaction> {
    const { userId, merchantId, amount } = transactionData;

    if (!validateAmount(amount)) {
      throw new ValidationError('Invalid amount');
    }

    return await db.transaction(async (query) => {
      // Verify user exists
      const userResult = await query(
        'SELECT id, region_id FROM users WHERE id = $1',
        [userId]
      );
      if (userResult.rows.length === 0) {
        throw new NotFoundError('User not found');
      }

      // Verify merchant exists and get cashback rate
      const merchantResult = await query(
        `SELECT m.id, m.name, m.region_id, m.commission_rate, r.cashback_rate
         FROM merchants m
         JOIN regions r ON m.region_id = r.id
         WHERE m.id = $1 AND m.status = 'active'`,
        [merchantId]
      );
      if (merchantResult.rows.length === 0) {
        throw new NotFoundError('Merchant not found or inactive');
      }

      const merchant = merchantResult.rows[0];
      const user = userResult.rows[0];

      // Verify user and merchant are in the same region
      if (user.region_id !== merchant.region_id) {
        throw new ValidationError('User and merchant must be in the same region');
      }

      // Calculate cashback amount
      const cashbackAmount = amount * parseFloat(merchant.cashback_rate);

      // Create transaction
      const transactionResult = await query(
        `INSERT INTO transactions (user_id, merchant_id, amount, cashback_amount, status) 
         VALUES ($1, $2, $3, $4, 'completed') 
         RETURNING *`,
        [userId, merchantId, amount, cashbackAmount]
      );

      const transaction = transactionResult.rows[0];

      // Update user wallet balance
      await query(
        'UPDATE users SET wallet_balance = wallet_balance + $1 WHERE id = $2',
        [cashbackAmount, userId]
      );

      // Get new balance for wallet movement
      const balanceResult = await query(
        'SELECT wallet_balance FROM users WHERE id = $1',
        [userId]
      );
      const newBalance = parseFloat(balanceResult.rows[0].wallet_balance);

      // Create wallet movement
      await query(
        `INSERT INTO wallet_movements (user_id, transaction_id, type, amount, balance_after, description) 
         VALUES ($1, $2, 'credit', $3, $4, $5)`,
        [userId, transaction.id, cashbackAmount, newBalance, `Cashback from ${merchant.name}`]
      );

      // Emit event
      await this.eventEmitter.emit('purchase.completed', {
        id: generateId(),
        type: 'purchase.completed',
        timestamp: new Date(),
        userId,
        merchantId,
        data: {
          transactionId: transaction.id,
          amount,
          cashbackAmount,
        }
      });

      return {
        id: transaction.id,
        userId: transaction.user_id,
        merchantId: transaction.merchant_id,
        amount: parseFloat(transaction.amount),
        cashbackAmount: parseFloat(transaction.cashback_amount),
        status: transaction.status,
        createdAt: transaction.created_at,
        updatedAt: transaction.updated_at,
      } as Transaction;
    });
  }

  async getTransactionById(transactionId: string): Promise<Transaction> {
    const result = await db.query(
      'SELECT * FROM transactions WHERE id = $1',
      [transactionId]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Transaction not found');
    }

    const transaction = result.rows[0];
    return {
      id: transaction.id,
      userId: transaction.user_id,
      merchantId: transaction.merchant_id,
      amount: parseFloat(transaction.amount),
      cashbackAmount: parseFloat(transaction.cashback_amount),
      status: transaction.status,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
    } as Transaction;
  }

  async getTransactionsByUser(userId: string, page: number = 1, limit: number = 20): Promise<{
    transactions: Transaction[];
    total: number;
  }> {
    const offset = (page - 1) * limit;

    const [transactionsResult, countResult] = await Promise.all([
      db.query(
        `SELECT * FROM transactions 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      ),
      db.query(
        'SELECT COUNT(*) FROM transactions WHERE user_id = $1',
        [userId]
      )
    ]);

    const transactions = transactionsResult.rows.map((transaction: any) => ({
      id: transaction.id,
      userId: transaction.user_id,
      merchantId: transaction.merchant_id,
      amount: parseFloat(transaction.amount),
      cashbackAmount: parseFloat(transaction.cashback_amount),
      status: transaction.status,
      createdAt: transaction.created_at,
      updatedAt: transaction.updated_at,
    })) as Transaction[];

    return {
      transactions,
      total: parseInt(countResult.rows[0].count)
    };
  }
}