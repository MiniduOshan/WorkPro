import { Router } from 'express';
import protect from '../middleware/authMiddleware.js';
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
router.get('/stats', getDocumentStats);
router.get('/:id', getDocument);
router.get('/:id/download', downloadDocument);
router.post('/', upload.single('file'), uploadDocument);
router.put('/:id', updateDocument);
router.delete('/:id', deleteDocument);

export default router;
