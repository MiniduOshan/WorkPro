import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createGroup, 
  listGroups, 
  getGroup, 
  joinGroup, 
  leaveGroup, 
  removeMemberFromGroup, 
  deleteGroup 
} from '../controllers/groupController.js';

const router = Router();

// List groups for a company
router.get('/', protect, listGroups);

// Get specific group details
router.get('/:id', protect, getGroup);

// Create a new group
router.post('/', protect, createGroup);

// Join a group
router.post('/:id/join', protect, joinGroup);

// Leave a group
router.post('/:id/leave', protect, leaveGroup);

// Remove a member from group (manager/owner only)
router.post('/:id/remove-member', protect, removeMemberFromGroup);

// Delete a group (manager/owner only)
router.delete('/:id', protect, deleteGroup);

export default router;