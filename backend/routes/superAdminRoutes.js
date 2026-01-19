import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  getSuperAdminAnalytics,
  getAllCompaniesAnalytics,
  getCompanyTaskAnalytics,
  updatePricingPlans,
  getPricingPlans,
  getPublicPricingPlans,
  getPublicStats,
  logActivity,
  getActivityLog,
  getUserAnalytics,
  updatePlatformContent,
  getPlatformContent,
  getPublicPlatformContent,
} from '../controllers/superAdminController.js';

const router = Router();

// Public endpoints (no auth required)
router.get('/public/pricing-plans', getPublicPricingPlans);
router.get('/public/stats', getPublicStats);
router.get('/public/platform-content', getPublicPlatformContent);

// Analytics endpoints
router.get('/analytics', protect, getSuperAdminAnalytics);
router.get('/analytics/companies', protect, getAllCompaniesAnalytics);
router.get('/analytics/company/:companyId/tasks', protect, getCompanyTaskAnalytics);
router.get('/analytics/users', protect, getUserAnalytics);

// Pricing plan management
router.get('/pricing-plans', protect, getPricingPlans);
router.put('/pricing-plans', protect, updatePricingPlans);

// Platform content management
router.get('/platform-content', protect, getPlatformContent);
router.put('/platform-content', protect, updatePlatformContent);

// Activity tracking
router.post('/activity', protect, logActivity);
router.get('/activity', protect, getActivityLog);

export default router;
