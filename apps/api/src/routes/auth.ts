import { Router, Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { body, validationResult } from 'express-validator';
import { ValidationError } from '@cashback/shared';

const router = Router();
const authService = new AuthService();

// Validation middleware
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('regionId').isUUID(),
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

router.post('/register', registerValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed: ' + errors.array().map(e => e.msg).join(', '));
    }

    const result = await authService.register(req.body);
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', loginValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed: ' + errors.array().map(e => e.msg).join(', '));
    }

    const result = await authService.login(req.body);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };