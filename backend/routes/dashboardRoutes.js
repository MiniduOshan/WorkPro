import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { enforceRole } from '../middleware/companyAuth.js';
import { managerSummary, userSummary, getTaskAnalytics, getManagerDashboard, getEmployeeDashboard } from '../controllers/dashboardController.js';

const router = Router();

// Manager dashboard routes - ONLY managers and owners can access
router.get('/manager', protect, enforceRole(['manager', 'owner']), managerSummary);
router.get('/manager-full', protect, enforceRole(['manager', 'owner']), getManagerDashboard);

// Employee dashboard routes - ONLY employees can access  
router.get('/user', protect, enforceRole(['employee']), userSummary);
router.get('/employee-full', protect, enforceRole(['employee']), getEmployeeDashboard);

// Analytics - all authenticated users
router.get('/analytics/tasks', protect, getTaskAnalytics);

export default router;
