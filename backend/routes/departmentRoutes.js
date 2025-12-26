import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { createDepartment, listDepartments, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';

const router = Router();

router.post('/', protect, createDepartment);
router.get('/', protect, listDepartments);
router.put('/:id', protect, updateDepartment);
router.delete('/:id', protect, deleteDepartment);

export default router;
