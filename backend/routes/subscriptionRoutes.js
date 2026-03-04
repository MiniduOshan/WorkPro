import express from 'express';
import { subscribe, cancelSubscription, adminAssignPlan, getBillingHistory } from '../controllers/subscriptionController.js';
import { protect, requireSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/subscribe', protect, subscribe);
router.post('/cancel', protect, cancelSubscription);
router.post('/admin-assign', protect, requireSuperAdmin, adminAssignPlan);
router.get('/history/:companyId', protect, getBillingHistory);

export default router;
