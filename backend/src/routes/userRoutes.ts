import { Router } from 'express';
import { userController } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();

// GET /api/users/profile
router.get('/profile', authenticate, (req, res, next) => userController.getProfile(req, res, next));

// PUT /api/users/profile
router.put('/profile', authenticate, (req, res, next) => userController.updateProfile(req, res, next));

export default router;

