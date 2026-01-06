import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  getSuperAdminAnalytics,
  getAllCompaniesAnalytics,
  getCompanyTaskAnalytics,
  updatePricingPlans,
  getPricingPlans,
  logActivity,
  getActivityLog,
  getUserAnalytics,
} from '../controllers/superAdminController.js';

const router = Router();

// Analytics endpoints
router.get('/analytics', protect, getSuperAdminAnalytics);
router.get('/analytics/companies', protect, getAllCompaniesAnalytics);
router.get('/analytics/company/:companyId/tasks', protect, getCompanyTaskAnalytics);
router.get('/analytics/users', protect, getUserAnalytics);

// Pricing plan management
router.get('/pricing-plans', protect, getPricingPlans);
router.put('/pricing-plans', protect, updatePricingPlans);

// Activity tracking
router.post('/activity', protect, logActivity);
router.get('/activity', protect, getActivityLog);

export default router;
