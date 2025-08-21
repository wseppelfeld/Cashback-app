import { Router, Response, NextFunction } from 'express';
import { db } from '../server';
import { authenticate, AuthRequest } from '../middleware/auth';
import { UserService } from '../services/userService';
import { body, validationResult } from 'express-validator';
import { ValidationError, generateId } from '@cashback/shared';

const router = Router();
const userService = new UserService();

// Get wallet balance and recent movements
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getUserById(req.userId!);
    
    // Get recent wallet movements
    const movementsResult = await db.query(
      `SELECT * FROM wallet_movements 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 10`,
      [req.userId]
    );

    const movements = movementsResult.rows.map((movement: any) => ({
      id: movement.id,
      userId: movement.user_id,
      transactionId: movement.transaction_id,
      type: movement.type,
      amount: parseFloat(movement.amount),
      balanceAfter: parseFloat(movement.balance_after),
      description: movement.description,
      createdAt: movement.created_at,
    }));

    res.json({
      success: true,
      data: {
        balance: user.walletBalance,
        movements
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get wallet movements with pagination
router.get('/movements', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const [movementsResult, countResult] = await Promise.all([
      db.query(
        `SELECT * FROM wallet_movements 
         WHERE user_id = $1 
         ORDER BY created_at DESC 
         LIMIT $2 OFFSET $3`,
        [req.userId, limit, offset]
      ),
      db.query(
        'SELECT COUNT(*) FROM wallet_movements WHERE user_id = $1',
        [req.userId]
      )
    ]);

    const movements = movementsResult.rows.map((movement: any) => ({
      id: movement.id,
      userId: movement.user_id,
      transactionId: movement.transaction_id,
      type: movement.type,
      amount: parseFloat(movement.amount),
      balanceAfter: parseFloat(movement.balance_after),
      description: movement.description,
      createdAt: movement.created_at,
    }));

    res.json({
      success: true,
      data: movements,
      pagination: {
        page,
        limit,
        total: parseInt(countResult.rows[0].count),
        totalPages: Math.ceil(parseInt(countResult.rows[0].count) / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Redeem cashback (debit wallet)
const redeemValidation = [
  body('amount').isFloat({ min: 0.01 }),
  body('description').notEmpty().trim(),
];

router.post('/redeem', authenticate, redeemValidation, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed: ' + errors.array().map(e => e.msg).join(', '));
    }

    const { amount, description } = req.body;

    const newBalance = await db.transaction(async (query: any) => {
      // Update user balance
      const newBalance = await userService.updateWalletBalance(req.userId!, -amount);

      // Create wallet movement
      await query(
        `INSERT INTO wallet_movements (user_id, type, amount, balance_after, description) 
         VALUES ($1, 'debit', $2, $3, $4)`,
        [req.userId, amount, newBalance, description]
      );

      return newBalance;
    });

    res.json({
      success: true,
      data: {
        newBalance,
        amount,
        description
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as walletRoutes };