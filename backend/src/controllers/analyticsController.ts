import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { interviewService } from '../services/interviewService';

export class AnalyticsController {
  async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const analytics = await interviewService.getDashboardAnalytics(userId);
      res.json({
        success: true,
        data: analytics,
      });
    } catch (error: any) {
      next(error);
    }
  }
}

export const analyticsController = new AnalyticsController();

