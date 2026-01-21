import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { createTask, listTasks, getTask, updateTask, deleteTask, approveReassignment, getPendingReassignments, getPendingApprovals, approveTask } from '../controllers/taskController.js';

const router = Router();

router.post('/', protect, createTask);
router.get('/pending-reassignments', protect, getPendingReassignments);
router.get('/pending-approvals', protect, getPendingApprovals);
router.get('/', protect, listTasks);
router.get('/:id', protect, getTask);
router.put('/:id', protect, updateTask);
router.post('/:id/approve-reassignment', protect, approveReassignment);
router.post('/:id/approve-task', protect, approveTask);
router.delete('/:id', protect, deleteTask);

export default router;

