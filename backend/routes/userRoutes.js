import { Router } from 'express';
import userController from '../controllers/userController.js';
import protect from '../middleware/authMiddleware.js';

// Multer will be passed via app.upload from server.js
let upload;

const router = Router();

// Middleware to set up multer from app context
router.use((req, res, next) => {
    if (!upload && req.app.upload) {
        upload = req.app.upload;
    }
    next();
});

// Public Routes
router.post('/signup', userController.registerUser);
router.post('/login', userController.authUser); 

// FIX: Added public route for user lookup by email (used by invitation modal)
router.get('/lookup', userController.getUserByEmail); // Assumes controller is updated

// Protected Routes
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);

// File upload route - requires multer middleware
router.post('/upload-profile-pic', protect, (req, res, next) => {
    if (!upload) {
        return res.status(500).json({ message: 'Upload service not available' });
    }
    upload.single('profilePic')(req, res, next);
}, userController.uploadProfilePic);

export default router;