import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getMyNotes, createNote, updateNote, deleteNote } from '../controllers/notesController.js';

const router = express.Router();

router.use(protect);

router.get('/', getMyNotes);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);

export default router;
