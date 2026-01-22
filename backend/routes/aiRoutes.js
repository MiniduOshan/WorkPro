import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getDailySummaryData,
  generateAISummary,
  breakdownTask,
  progressSummary,
} from '../controllers/aiController.js';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/daily-data', getDailySummaryData);
router.get('/summarize', generateAISummary);
router.post('/breakdown', breakdownTask);
router.get('/progress-summary', progressSummary);

export default router;
