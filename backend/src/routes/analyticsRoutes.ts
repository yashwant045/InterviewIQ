import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// GET /api/analytics/dashboard
router.get('/dashboard', authenticate, (req, res, next) =>
  analyticsController.getDashboard(req, res, next)
);

export default router;

