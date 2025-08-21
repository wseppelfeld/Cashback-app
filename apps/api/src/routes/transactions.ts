import { Router, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transactionService';
import { authenticate, AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { ValidationError } from '@cashback/shared';

const router = Router();
const transactionService = new TransactionService();

// Create transaction validation
const createTransactionValidation = [
  body('merchantId').isUUID(),
  body('amount').isFloat({ min: 0.01 }),
];

// Create new transaction
router.post('/', authenticate, createTransactionValidation, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed: ' + errors.array().map(e => e.msg).join(', '));
    }

    const transactionData = {
      userId: req.userId!,
      merchantId: req.body.merchantId,
      amount: req.body.amount,
    };

    const transaction = await transactionService.createTransaction(transactionData);
    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

// Get transaction by ID
router.get('/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const transaction = await transactionService.getTransactionById(req.params.id);
    res.json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
});

// Get user's transactions
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await transactionService.getTransactionsByUser(req.userId!, page, limit);
    res.json({
      success: true,
      data: result.transactions,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as transactionRoutes };