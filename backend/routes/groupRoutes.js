import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { createGroup, listGroups, getGroup, updateGroup, deleteGroup, addMemberToGroup, removeMemberFromGroup, joinGroup, leaveGroup } from '../controllers/groupController.js';

const router = Router();

router.post('/', protect, createGroup);
router.get('/', protect, listGroups);
router.get('/:id', protect, getGroup);
router.put('/:id', protect, updateGroup);
router.post('/:id/members/add', protect, addMemberToGroup);
router.post('/:id/members/remove', protect, removeMemberFromGroup);
router.post('/:id/join', protect, joinGroup);
router.post('/:id/leave', protect, leaveGroup);
router.delete('/:id', protect, deleteGroup);

export default router;
