import { Router } from 'express';
import { interviewController } from '../controllers/interviewController';
import { authenticate, authorizeInterviewOwnership } from '../middleware/authMiddleware';

const router = Router();

// POST /api/interviews (Create interview)
router.post('/', authenticate, (req, res, next) =>
  interviewController.createInterview(req, res, next)
);

// GET /api/interviews (Interview history)
router.get('/', authenticate, (req, res, next) =>
  interviewController.getUserInterviews(req, res, next)
);

// GET /api/interviews/:id (Interview details)
router.get('/:id', authenticate, authorizeInterviewOwnership(), (req, res, next) =>
  interviewController.getInterviewDetails(req, res, next)
);

// POST /api/interviews/:id/start (Start interview)
router.post('/:id/start', authenticate, authorizeInterviewOwnership(), (req, res, next) =>
  interviewController.startInterview(req, res, next)
);

// POST /api/interviews/:id/answer (Submit answer)
router.post('/:id/answer', authenticate, authorizeInterviewOwnership(), (req, res, next) =>
  interviewController.submitAnswer(req, res, next)
);

// GET /api/interviews/:id/report (Get evaluation & final report)
router.get('/:id/report', authenticate, authorizeInterviewOwnership(), (req, res, next) =>
  interviewController.getReport(req, res, next)
);

export default router;

