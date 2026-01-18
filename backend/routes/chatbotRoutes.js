import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
import {
  getChatbotConfig,
  getAllChatbotConfigs,
  updateChatbotConfig,
  deleteChatbotConfig,
} from '../controllers/chatbotController.js';

const router = Router();

// Public route - get chatbot config by type
router.get('/config/:type', getChatbotConfig);

// Protected routes - super admin only
router.get('/admin/configs', protect, getAllChatbotConfigs);
router.put('/admin/config/:type', protect, updateChatbotConfig);
router.delete('/admin/config/:type', protect, deleteChatbotConfig);

export default router;
