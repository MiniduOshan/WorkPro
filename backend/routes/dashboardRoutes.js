import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { managerSummary, userSummary } from '../controllers/dashboardController.js';

const router = Router();

router.get('/manager', protect, managerSummary);
router.get('/user', protect, userSummary);

export default router;
