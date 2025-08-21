import { Router, Request, Response, NextFunction } from 'express';
import { db } from '../server';

const router = Router();

// Get all regions
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.query(
      'SELECT id, name, currency, cashback_rate, created_at FROM regions ORDER BY name'
    );

    const regions = result.rows.map((region: any) => ({
      id: region.id,
      name: region.name,
      currency: region.currency,
      cashbackRate: parseFloat(region.cashback_rate),
      createdAt: region.created_at,
    }));

    res.json({
      success: true,
      data: regions
    });
  } catch (error) {
    next(error);
  }
});

// Get region by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await db.query(
      'SELECT id, name, currency, cashback_rate, created_at FROM regions WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Region not found'
      });
    }

    const region = result.rows[0];
    res.json({
      success: true,
      data: {
        id: region.id,
        name: region.name,
        currency: region.currency,
        cashbackRate: parseFloat(region.cashback_rate),
        createdAt: region.created_at,
      }
    });
  } catch (error) {
    next(error);
  }
});

export { router as regionRoutes };