import { rateLimit } from 'express-rate-limit';

// General rate limiter: Limit all API requests
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 1000, // Limit each IP to 1000 requests per `window`
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many requests from this IP, please try again after 15 minutes',
    },
});

// Stricter rate limiter for authentication routes: login, signup, forgot password
export const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    limit: 100, // Limit each IP to 100 requests per hour for auth routes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many authentication attempts from this IP, please try again after an hour',
    },
});

// Stricter rate limiter for critical actions (e.g., verifying email, resending)
export const sensitiveLimiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    limit: 50, // Limit each IP to 50 sensitive requests per 30 minutes
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Too many attempts. Please wait 30 minutes before trying again.',
    },
});
