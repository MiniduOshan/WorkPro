import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getDailySummaryData,
  generateAISummary,
  breakdownTask,
  progressSummary,
  getMonthlyReport,
} from '../controllers/aiController.js';
import { checkFeature } from '../middleware/limitMiddleware.js';

const router = Router();

// All routes require authentication
router.use(protect);

// AI-intensive routes (Require 'aiInsights' plan feature)
router.get('/summarize', checkFeature('aiInsights'), generateAISummary);
router.post('/breakdown', checkFeature('aiInsights'), breakdownTask);
router.get('/progress-summary', checkFeature('aiInsights'), progressSummary);
router.get('/daily-data', checkFeature('aiInsights'), getDailySummaryData);

// Monthly Report route (Require 'monthlyReports' plan feature)
router.get('/monthly-report', checkFeature('monthlyReports'), getMonthlyReport);

export default router;
