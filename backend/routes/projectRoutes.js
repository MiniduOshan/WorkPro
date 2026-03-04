import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkLimit } from '../middleware/limitMiddleware.js';
import { createProject, listProjects, updateProject, deleteProject } from '../controllers/projectController.js';

const router = Router();

router.post('/', protect, checkLimit('maxProjects'), createProject);
router.get('/', protect, listProjects);
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

export default router;
