import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  createChannel, 
  listChannels, 
  postMessage, 
  listMessages, 
  deleteChannel,
  requestJoinChannel,
  approveJoinRequest,
  rejectJoinRequest,
  addMemberToChannel,
  removeMemberFromChannel
} from '../controllers/channelController.js';

const router = Router();

router.post('/', protect, createChannel);
router.get('/', protect, listChannels);
router.get('/:id', protect, listMessages);
router.post('/:id/messages', protect, postMessage);
router.delete('/:id', protect, deleteChannel);
router.post('/:id/request-join', protect, requestJoinChannel);
router.post('/:id/approve-join', protect, approveJoinRequest);
router.post('/:id/reject-join', protect, rejectJoinRequest);
router.post('/:id/add-member', protect, addMemberToChannel);
router.post('/:id/remove-member', protect, removeMemberFromChannel);

export default router;
