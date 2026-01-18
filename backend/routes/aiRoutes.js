import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  getDailySummaryData,
  generateAISummary,
} from '../controllers/aiController.js';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/daily-data', getDailySummaryData);
router.get('/summarize', generateAISummary);

export default router;
