import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { managerSummary, userSummary, getTaskAnalytics, getManagerDashboard, getEmployeeDashboard } from '../controllers/dashboardController.js';

const router = Router();

router.get('/manager', protect, managerSummary);
router.get('/user', protect, userSummary);
router.get('/analytics/tasks', protect, getTaskAnalytics);
router.get('/manager-full', protect, getManagerDashboard);
router.get('/employee-full', protect, getEmployeeDashboard);

export default router;
