import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createTask, listTasks, getTask, updateTask, deleteTask } from '../controllers/taskController.js';

const router = Router();

router.post('/', protect, createTask);
router.get('/', protect, listTasks);
router.get('/:id', protect, getTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);

export default router;

