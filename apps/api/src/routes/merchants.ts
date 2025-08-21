import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../server';
import { authenticate } from '../middleware/auth';
import { body, validationResult } from 'express-validator';
import { ValidationError, NotFoundError } from '@cashback/shared';

const router = Router();

// Create merchant validation
const createMerchantValidation = [
  body('name').notEmpty().trim().isLength({ min: 2, max: 255 }),
  body('regionId').isUUID(),
  body('commissionRate').isFloat({ min: 0, max: 1 }),
];

// Create new merchant
router.post('/', createMerchantValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError('Validation failed: ' + errors.array().map(e => e.msg).join(', '));
    }

    const { name, regionId, commissionRate } = req.body;

    // Verify region exists
    const regionResult = await db.query(
      'SELECT id FROM regions WHERE id = $1',
      [regionId]
    );
    if (regionResult.rows.length === 0) {
      throw new NotFoundError('Region not found');
    }

    const result = await db.query(
      `INSERT INTO merchants (name, region_id, commission_rate, status) 
       VALUES ($1, $2, $3, 'pending') 
       RETURNING *`,
      [name, regionId, commissionRate]
    );

    const merchant = result.rows[0];
    res.status(201).json({
      success: true,
      data: {
        id: merchant.id,
        name: merchant.name,
        regionId: merchant.region_id,
        commissionRate: parseFloat(merchant.commission_rate),
        status: merchant.status,
        createdAt: merchant.created_at,
        updatedAt: merchant.updated_at,
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all merchants
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const [merchantsResult, countResult] = await Promise.all([
      db.query(
        `SELECT m.*, r.name as region_name 
         FROM merchants m 
         JOIN regions r ON m.region_id = r.id 
         ORDER BY m.created_at DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      ),
      db.query('SELECT COUNT(*) FROM merchants')
    ]);

    const merchants = merchantsResult.rows.map((merchant: any) => ({
      id: merchant.id,
      name: merchant.name,
      regionId: merchant.region_id,
      regionName: merchant.region_name,
      commissionRate: parseFloat(merchant.commission_rate),
      status: merchant.status,
      createdAt: merchant.created_at,
      updatedAt: merchant.updated_at,
    }));

    res.json({
      success: true,
      data: merchants,
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

// Get merchant by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.query(
      `SELECT m.*, r.name as region_name 
       FROM merchants m 
       JOIN regions r ON m.region_id = r.id 
       WHERE m.id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Merchant not found');
    }

    const merchant = result.rows[0];
    res.json({
      success: true,
      data: {
        id: merchant.id,
        name: merchant.name,
        regionId: merchant.region_id,
        regionName: merchant.region_name,
        commissionRate: parseFloat(merchant.commission_rate),
        status: merchant.status,
        createdAt: merchant.created_at,
        updatedAt: merchant.updated_at,
      }
    });
  } catch (error) {
    next(error);
  }
});

// Update merchant status
router.patch('/:id/status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'inactive', 'pending'].includes(status)) {
      throw new ValidationError('Invalid status');
    }

    const result = await db.query(
      'UPDATE merchants SET status = $1 WHERE id = $2 RETURNING *',
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Merchant not found');
    }

    const merchant = result.rows[0];
    res.json({
      success: true,
      data: {
        id: merchant.id,
        name: merchant.name,
        regionId: merchant.region_id,
        commissionRate: parseFloat(merchant.commission_rate),
        status: merchant.status,
        createdAt: merchant.created_at,
        updatedAt: merchant.updated_at,
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as merchantRoutes };