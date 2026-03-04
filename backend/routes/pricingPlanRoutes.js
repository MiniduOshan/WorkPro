import express from 'express';
import {
    getPublicPlans,
    getAllPlans,
    createPlan,
    updatePlan,
    deletePlan
} from '../controllers/pricingPlanController.js';
import { protect, requireSuperAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/public', getPublicPlans);

// Admin routes
router.get('/', protect, requireSuperAdmin, getAllPlans);
router.post('/', protect, requireSuperAdmin, createPlan);
router.put('/:id', protect, requireSuperAdmin, updatePlan);
router.delete('/:id', protect, requireSuperAdmin, deletePlan);

export default router;
