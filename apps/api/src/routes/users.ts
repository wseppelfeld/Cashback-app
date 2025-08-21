import { Router } from 'express';
import { UserService } from '../services/userService';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const userService = new UserService();

// Get current user profile
router.get('/profile', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await userService.getUserById(req.userId!);
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
});

// Get users by region (admin endpoint)
router.get('/region/:regionId', authenticate, async (req, res, next) => {
  try {
    const { regionId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await userService.getUsersByRegion(regionId, page, limit);
    res.json({
      success: true,
      data: result.users,
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

export { router as userRoutes };