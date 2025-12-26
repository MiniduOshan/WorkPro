import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { createAnnouncement, listAnnouncements, getAnnouncement, deleteAnnouncement } from '../controllers/announcementController.js';

const router = Router();

router.post('/', protect, createAnnouncement);
router.get('/', protect, listAnnouncements);
router.get('/:id', protect, getAnnouncement);
router.delete('/:id', protect, deleteAnnouncement);

export default router;
