import { Router } from 'express';
import { resumeController } from '../controllers/resumeController';
import { authenticate } from '../middleware/authMiddleware';
import { resumeUpload } from '../middleware/uploadMiddleware';

const router = Router();

// POST /api/resumes/upload
router.post('/upload', authenticate, resumeUpload.single('resume'), (req, res, next) =>
  resumeController.upload(req, res, next)
);

// GET /api/resumes/latest
router.get('/latest', authenticate, (req, res, next) =>
  resumeController.getLatest(req, res, next)
);

export default router;

