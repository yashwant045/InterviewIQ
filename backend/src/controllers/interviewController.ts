import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { interviewService } from '../services/interviewService';
import { createInterviewSchema, submitAnswerSchema } from '../validators/interviewValidator';

export class InterviewController {
  async createInterview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const parsed = createInterviewSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const interview = await interviewService.createInterview(userId, parsed.data as any);
      res.status(201).json({
        success: true,
        message: 'Interview session created',
        data: interview,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getUserInterviews(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const interviews = await interviewService.getUserInterviews(userId);
      res.json({
        success: true,
        data: interviews,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getInterviewDetails(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const interviewId = String(req.params.id);
      const details = await interviewService.getInterviewDetails(interviewId);
      res.json({
        success: true,
        data: details,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async startInterview(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const interviewId = String(req.params.id);
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await interviewService.startInterview(interviewId, userId);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async submitAnswer(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const interviewId = String(req.params.id);
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const parsed = submitAnswerSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          success: false,
          errors: parsed.error.flatten().fieldErrors,
        });
        return;
      }

      const result = await interviewService.submitAnswer(interviewId, userId, parsed.data as any);
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getReport(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const interviewId = String(req.params.id);
      const reportData = await interviewService.getReport(interviewId);
      res.json({
        success: true,
        data: reportData,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const interviewController = new InterviewController();
