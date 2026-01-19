import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import { createChannel, listChannels, postMessage, listMessages, deleteChannel } from '../controllers/channelController.js';

const router = Router();

router.post('/', protect, createChannel);
router.get('/', protect, listChannels);
router.post('/:id/messages', protect, postMessage);
router.get('/:id/messages', protect, listMessages);
router.delete('/:id', protect, deleteChannel);

export default router;
