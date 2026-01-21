import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { createDepartment, listDepartments, updateDepartment, deleteDepartment, getDepartmentMembers, addMemberToDepartment, removeMemberFromDepartment, joinDepartment, leaveDepartment } from '../controllers/departmentController.js';

const router = Router();

router.post('/', protect, createDepartment);
router.get('/', protect, listDepartments);
router.get('/:id/members', protect, getDepartmentMembers);
router.put('/:id', protect, updateDepartment);
router.post('/:id/members/add', protect, addMemberToDepartment);
router.post('/:id/members/remove', protect, removeMemberFromDepartment);
router.post('/:id/join', protect, joinDepartment);
router.post('/:id/leave', protect, leaveDepartment);
router.delete('/:id', protect, deleteDepartment);

export default router;
