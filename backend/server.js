// server.js (Your provided code - No further changes required)

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';
import connectDB from './config/db.js';
import userRoutes from './routes/userRoutes.js';
// WorkPro routes
import companyRoutes from './routes/companyRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import channelRoutes from './routes/channelRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import superAdminRoutes from './routes/superAdminRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import notesRoutes from './routes/notesRoutes.js';
import pricingPlanRoutes from './routes/pricingPlanRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';
import { generalLimiter } from './middleware/rateLimitMiddleware.js';
// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        // Sanitize: allow only alphanumeric for name part
        const sanitizedBase = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        cb(null, 'profile-' + uniqueSuffix + '-' + sanitizedBase + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedExtensions = /^\.(jpeg|jpg|png)$/;
        const allowedMimes = /image\/(jpeg|png)/;
        const ext = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.test(ext) && allowedMimes.test(file.mimetype)) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG, JPG, and PNG image files are allowed for profile pictures.'));
        }
    }
});

// Middleware
const corsOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : undefined;
app.use(cors({ origin: corsOrigins || true }));
app.use(express.json({ limit: '50mb' })); // For parsing application/json with increased limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // For parsing form data with increased limit

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir));

// Store upload middleware in app for use in routes
app.upload = upload;

// Basic route for testing
app.get('/', (req, res) => {
    res.send('WorkPro API is running...');
});

// API Routes
app.use('/api', generalLimiter);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/channels', channelRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/super-admin', superAdminRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/pricing-plans', pricingPlanRoutes);
app.use('/api/subscriptions', subscriptionRoutes);

// 404 handler for undefined routes
app.use((req, res, next) => {
    console.log(`404 - Route not found: ${req.method} ${req.url}`);
    res.status(404).json({
        message: 'Route not found',
        path: req.url,
        method: req.method
    });
});

// Fallback Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('ERROR CAUGHT BY GLOBAL HANDLER:');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
    console.error('Full error object:', err);
    res.status(500).json({ message: err.message || 'Something broke!' });
});

// Socket.io Setup
import { createServer } from 'http';
import { Server } from 'socket.io';

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: corsOrigins || "*", // Allow all if not specified, or match express cors
        methods: ["GET", "POST"]
    }
});

// Track active users
let activeUsers = 0;

io.on('connection', (socket) => {
    activeUsers++;


    // Broadcast active user count to all clients (or just admins if we separated namespaces)
    io.emit('activeUsers', activeUsers);

    socket.on('disconnect', () => {
        activeUsers--;

        io.emit('activeUsers', activeUsers);
    });
});

// Store io in app for use in routes if needed
app.set('io', io);

// ... (Error handling middleware remains above)

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});