import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkLimit } from '../middleware/limitMiddleware.js';
import {
  getDocuments,
  uploadDocument,
  getDocument,
  downloadDocument,
  updateDocument,
  deleteDocument,
  getDocumentStats,
  upload,
} from '../controllers/documentController.js';

const router = Router();

// All routes require authentication
router.use(protect);

router.get('/', getDocuments);
router.post('/', upload.single('file'), checkLimit('maxStorage'), uploadDocument);
router.get('/stats', getDocumentStats);
router.get('/:id', getDocument);
router.get('/:id/download', downloadDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
