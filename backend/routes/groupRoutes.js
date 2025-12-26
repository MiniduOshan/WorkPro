import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { createGroup, listGroups, updateGroup, deleteGroup } from '../controllers/groupController.js';

const router = Router();

router.post('/', protect, createGroup);
router.get('/', protect, listGroups);
router.put('/:id', protect, updateGroup);
router.delete('/:id', protect, deleteGroup);

export default router;
