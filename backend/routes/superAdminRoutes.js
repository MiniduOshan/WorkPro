import { Router } from 'express';
import { protect, requireSuperAdmin } from '../middleware/authMiddleware.js';
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
  createNotification,
  getAllNotifications,
  getUserNotifications,
  markNotificationAsRead,
  updateNotification,
  deleteNotification,
} from '../controllers/superAdminController.js';

const router = Router();

// Public endpoints (no auth required)
router.get('/public/pricing-plans', getPublicPricingPlans);
router.get('/public/stats', getPublicStats);
router.get('/public/platform-content', getPublicPlatformContent);

// User notifications (any authenticated user)
router.get('/notifications', protect, getUserNotifications);
router.post('/notifications/:notificationId/read', protect, markNotificationAsRead);

// Protected super admin routes
router.use(protect, requireSuperAdmin);

// Analytics endpoints
router.get('/analytics', getSuperAdminAnalytics);
router.get('/analytics/companies', getAllCompaniesAnalytics);
router.get('/analytics/company/:companyId/tasks', getCompanyTaskAnalytics);
router.get('/analytics/users', getUserAnalytics);

// Pricing plan management
router.get('/pricing-plans', getPricingPlans);
router.put('/pricing-plans', updatePricingPlans);

// Platform content management
router.get('/platform-content', getPlatformContent);
router.put('/platform-content', updatePlatformContent);

// Notifications / Maintenance Messages
router.post('/notifications', createNotification);
router.get('/notifications/all', getAllNotifications);
router.put('/notifications/:notificationId', updateNotification);
router.delete('/notifications/:notificationId', deleteNotification);

// Activity tracking
router.post('/activity', logActivity);
router.get('/activity', getActivityLog);

export default router;
