import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  getWorkflowRules,
  getWorkflowRule,
  createWorkflowRule,
  updateWorkflowRule,
  deleteWorkflowRule,
  toggleWorkflowRule,
  getWorkflowStats,
} from '../controllers/automationController.js';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/', getWorkflowRules);
router.get('/stats', getWorkflowStats);
router.get('/:id', getWorkflowRule);
router.post('/', createWorkflowRule);
router.put('/:id', updateWorkflowRule);
router.patch('/:id/toggle', toggleWorkflowRule);
router.delete('/:id', deleteWorkflowRule);

export default router;
