import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// POST /api/auth/register
router.post('/register', (req, res, next) => authController.register(req, res, next));

// POST /api/auth/login
router.post('/login', (req, res, next) => authController.login(req, res, next));

export default router;

