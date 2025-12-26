import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { createTeam, listTeams, updateTeam, deleteTeam } from '../controllers/teamController.js';

const router = Router();

router.post('/', protect, createTeam);
router.get('/', protect, listTeams);
router.put('/:id', protect, updateTeam);
router.delete('/:id', protect, deleteTeam);

export default router;
