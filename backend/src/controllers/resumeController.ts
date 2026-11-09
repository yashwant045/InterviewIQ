import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { resumeService } from '../services/resumeService';

export class ResumeController {
  async upload(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      if (!req.file) {
        res.status(400).json({ success: false, message: 'No resume file uploaded.' });
        return;
      }

      const result = await resumeService.processResumeUpload(userId, req.file);
      res.status(200).json({
        success: true,
        message: 'Resume parsed and uploaded successfully',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getLatest(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const resume = await resumeService.getLatestResume(userId);
      res.json({
        success: true,
        data: resume,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const resumeController = new ResumeController();

