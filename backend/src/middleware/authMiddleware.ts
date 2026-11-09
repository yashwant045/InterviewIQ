import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt';
import { interviewRepository } from '../repositories/interviewRepository';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No Bearer token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

export function authorizeInterviewOwnership() {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const interviewId = String(req.params.id);
      if (!interviewId) {
        res.status(400).json({ success: false, message: 'Interview ID is required.' });
        return;
      }

      const interview = await interviewRepository.findById(interviewId);
      if (!interview) {
        res.status(404).json({ success: false, message: 'Interview session not found.' });
        return;
      }

      if (req.user && interview.user_id !== req.user.userId) {
        res.status(403).json({ success: false, message: 'Access denied: You do not own this interview resource.' });
        return;
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: 'Authorization verification failed.' });
    }
  };
}
