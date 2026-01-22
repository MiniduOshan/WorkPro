import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createDepartment, listDepartments, updateDepartment, deleteDepartment, getDepartmentDetail, addMemberToDepartment, removeMemberFromDepartment, joinDepartment, leaveDepartment } from '../controllers/departmentController.js';

const router = Router();

router.post('/', protect, createDepartment);
router.get('/', protect, listDepartments);
router.get('/:id', protect, getDepartmentDetail);
router.put('/:id', protect, updateDepartment);
router.post('/:id/members/add', protect, addMemberToDepartment);
router.post('/:id/members/remove', protect, removeMemberFromDepartment);
router.post('/:id/join', protect, joinDepartment);
router.post('/:id/leave', protect, leaveDepartment);
router.delete('/:id', protect, deleteDepartment);

export default router;
