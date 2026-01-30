import User from '../models/User.js';
import generateToken from '../config/generateToken.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../config/email.js';
import { OAuth2Client } from 'google-auth-library';

// Fixed super admin email - cannot be changed through website
const SUPER_ADMIN_EMAIL = 'admin.workpro@gmail.com';

const googleOAuthClient = new OAuth2Client();

// Helper function to structure user response (used for both signup and login success)
const getUserResponse = (user) => {
    // A user is super admin if they are flagged OR they match the fixed email
    const isSuperAdmin = user.isSuperAdmin === true || user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    
    return {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: `${user.firstName} ${user.lastName}`, // The combined name
        email: user.email,
        isSuperAdmin: isSuperAdmin,
        token: generateToken(user._id),
        user: {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isSuperAdmin: isSuperAdmin,
        }
    };
};

// @desc 	Register a new user (Sign Up)
// @route 	POST /api/users/signup
// @access 	Public
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match' });
    }

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if this is the super admin email
        const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        
        const user = await User.create({ 
            firstName, 
            lastName, 
            email, 
            password,
            isSuperAdmin: isSuperAdmin  // Only set true for admin.workpro@gmail.com
        });

        if (user) {
            res.status(201).json(getUserResponse(user));
        } else {
            res.status(400).json({ message: 'Invalid user data (Mongoose validation error)' });
        }
    } catch (error) {
        console.error("[AUTH ERROR] Database or Server Error during signup:", error); 
        res.status(500).json({ message: error.message });
    }
};

// @desc 	Auth user & get token (Login)
// @route 	POST /api/users/login
// @access 	Public
const authUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            // Keep any existing super-admin flag, but also allow the fixed admin email
            const isSuperAdmin = user.isSuperAdmin === true || email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
            if (user.isSuperAdmin !== isSuperAdmin) {
                user.isSuperAdmin = isSuperAdmin;
                await user.save();
            }
            res.json(getUserResponse(user));
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc 	Get user ID and name by email
// @route 	GET /api/users/lookup?email=...
// @access 	Public (Used for invitation flow)
const getUserByEmail = async (req, res) => {
    const { email } = req.query; 

    if (!email) {
        return res.status(400).json({ message: 'Email query parameter is required for lookup.' });
    }

    try {
        const user = await User.findOne({ email }).select('_id firstName lastName'); 

        if (!user) {
            return res.status(404).json({ message: 'User not found with this email.' });
        }

        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
        });

    } catch (error) {
        console.error("[USER LOOKUP ERROR]:", error);
        res.status(500).json({ message: 'Server error during user lookup.' });
    }
};

// @desc 	Get user profile (NOW RETURNS new fields)
// @route 	GET /api/users/profile
// @access 	Private (Requires JWT via 'protect' middleware)
const getUserProfile = async (req, res) => {
    const user = req.user; 

    if (user) {
        res.json({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            username: `${user.firstName} ${user.lastName}`,
            email: user.email,
            mobileNumber: user.mobileNumber, // <--- NEW FIELD
            profilePic: user.profilePic,     // <--- NEW FIELD
            createdAt: user.createdAt,
        });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc 	Update user profile (NOW HANDLES profilePic, mobileNumber, name updates)
// @route 	PUT /api/users/profile
// @access 	Private (Requires JWT via 'protect' middleware)
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        // Update name, mobile number, and profile pic
        user.firstName = req.body.firstName || user.firstName;
        user.lastName = req.body.lastName || user.lastName;
        user.mobileNumber = req.body.mobileNumber || user.mobileNumber; 
        
        // Allow updating profilePic URL (using !== undefined to allow clearing the field)
        if (req.body.profilePic !== undefined) { 
             user.profilePic = req.body.profilePic;
        }

        // Handle potential email change
        if (req.body.email && req.body.email !== user.email) {
             const emailExists = await User.findOne({ email: req.body.email });
             if (emailExists) {
                 return res.status(400).json({ message: 'Email already in use.' });
             }
             user.email = req.body.email; 
        }

        // Handle password change logic
        if (req.body.password) {
            if (req.body.password !== req.body.confirmPassword) {
                 return res.status(400).json({ message: 'New passwords do not match' });
            }
            user.password = req.body.password; 
        }

        const updatedUser = await user.save();
        
        // Respond with the updated user data and a new JWT
        res.json(getUserResponse(updatedUser)); 
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc 	Upload user profile picture
// @route 	POST /api/users/upload-profile-pic
// @access 	Private (Requires JWT via 'protect' middleware)
const uploadProfilePic = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Store the file path relative to the uploads directory
        user.profilePic = `/uploads/${req.file.filename}`;
        
        const updatedUser = await user.save();

        res.json({
            message: 'Profile picture uploaded successfully',
            profilePic: user.profilePic,
            ...getUserResponse(updatedUser)
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'File upload failed: ' + error.message });
    }
};

// @desc 	Delete user account
// @route 	DELETE /api/users/account
// @access 	Private (Requires JWT via 'protect' middleware)
const deleteUserAccount = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Import all necessary models
        const Company = req.app.locals.Company || (await import('../models/Company.js')).default;
        const Task = req.app.locals.Task || (await import('../models/Task.js')).default;
        const Project = req.app.locals.Project || (await import('../models/Project.js')).default;
        const Note = req.app.locals.Note || (await import('../models/Note.js')).default;
        const Group = req.app.locals.Group || (await import('../models/Group.js')).default;
        const Department = req.app.locals.Department || (await import('../models/Department.js')).default;
        const Team = req.app.locals.Team || (await import('../models/Team.js')).default;
        const Channel = req.app.locals.Channel || (await import('../models/Channel.js')).default;
        const Notification = req.app.locals.Notification || (await import('../models/Notification.js')).default;
        const Invitation = req.app.locals.Invitation || (await import('../models/Invitation.js')).default;

        // 1. Delete companies where user is the owner
        await Company.deleteMany({ owner: user._id });

        // 2. Remove user from company members arrays
        await Company.updateMany(
            { 'members.user': user._id },
            { $pull: { members: { user: user._id } } }
        );

        // 3. Delete user's personal notes
        await Note.deleteMany({ user: user._id });

        // 4. Remove user from groups
        await Group.updateMany(
            { members: user._id },
            { $pull: { members: user._id } }
        );

        // 5. Remove user from departments (managers)
        await Department.updateMany(
            { managers: user._id },
            { $pull: { managers: user._id } }
        );

        // 6. Remove user from teams
        await Team.updateMany(
            { members: user._id },
            { $pull: { members: user._id } }
        );

        // 7. Remove user from channels
        await Channel.updateMany(
            { members: user._id },
            { $pull: { members: user._id } }
        );

        // 8. Delete user's channels
        await Channel.deleteMany({ user: user._id });

        // 9. Unassign tasks assigned to user (set assignee to null instead of deleting)
        await Task.updateMany(
            { assignee: user._id },
            { $unset: { assignee: "" } }
        );

        // 10. Update tasks created by user (keep them but mark createdBy as deleted)
        await Task.updateMany(
            { createdBy: user._id },
            { createdBy: null }
        );

        // 11. Update projects created by user
        await Project.updateMany(
            { createdBy: user._id },
            { createdBy: null }
        );

        // 12. Delete notifications related to user
        await Notification.deleteMany({
            $or: [
                { createdBy: user._id },
                { targetUsers: user._id },
                { 'readBy.user': user._id }
            ]
        });

        // 13. Delete invitations created by user
        await Invitation.deleteMany({ inviter: user._id });

        // 14. Delete the user account
        await User.deleteOne({ _id: user._id });

        res.json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({ message: 'Failed to delete account: ' + error.message });
    }
};

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    console.log('[FORGOT PASSWORD] Request received for email:', email);
    console.log('[FORGOT PASSWORD] Environment check:', {
        SMTP_HOST: process.env.SMTP_HOST,
        SMTP_PORT: process.env.SMTP_PORT,
        SMTP_USER: process.env.SMTP_USER,
        SMTP_PASS: process.env.SMTP_PASS ? '***set***' : 'MISSING',
        SMTP_FROM: process.env.SMTP_FROM,
        FRONTEND_URL: process.env.FRONTEND_URL
    });

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log('[FORGOT PASSWORD] User not found for email:', email);
            // Don't reveal if user exists or not for security
            return res.json({ message: 'If an account exists, a password reset link will be sent.' });
        }

        console.log('[FORGOT PASSWORD] User found, generating reset token');

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        // Hash token and set expiry (1 hour)
        user.resetPasswordToken = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');
        user.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
        
        await user.save();

        // Create reset URL
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
        console.log('[FORGOT PASSWORD] Reset URL created:', resetUrl);

        try {
            console.log('[FORGOT PASSWORD] Attempting to send email to:', user.email);
            await sendPasswordResetEmail({
                to: user.email,
                resetLink: resetUrl,
                firstName: user.firstName
            });

            console.log('[FORGOT PASSWORD] Email sent successfully to:', user.email);
            res.json({ message: 'Password reset email sent successfully' });
        } catch (emailError) {
            console.error('[FORGOT PASSWORD - EMAIL ERROR]:', {
                error: emailError.message,
                code: emailError.code,
                command: emailError.command,
                response: emailError.response,
                responseCode: emailError.responseCode,
                stack: emailError.stack,
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                user: process.env.SMTP_USER,
            });
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            
            return res.status(500).json({ 
                message: 'Email could not be sent. Please try again later.',
                error: emailError.message
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// @desc    Reset password with token
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { token, password } = req.body;

    if (!token || !password) {
        return res.status(400).json({ message: 'Token and password are required' });
    }

    try {
        // Hash the token to compare with stored hash
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ 
                message: 'Invalid or expired password reset token' 
            });
        }

        // Set new password (will be hashed by User model pre-save hook)
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ 
            message: 'Password reset successful',
            token: generateToken(user._id)
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Failed to reset password' });
    }
};

// @desc    Google OAuth (ID token verification)
// @route   POST /api/users/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    const credential = req.body?.credential || req.body?.idToken || req.query?.credential;
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || req.body?.clientId || req.query?.clientId;

    if (!credential) {
        return res.status(400).json({ message: 'Google credential is required.' });
    }

    if (!clientId) {
        return res.status(500).json({ message: 'Google client ID is not configured on the server.' });
    }

    try {
        const ticket = await googleOAuthClient.verifyIdToken({
            idToken: credential,
            audience: clientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
            return res.status(400).json({ message: 'Invalid Google token payload.' });
        }

        const email = payload.email.toLowerCase();
        const firstName = payload.given_name || payload.name?.split(' ')[0] || 'User';
        const lastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ') || 'Account';
        const googleId = payload.sub;

        let user = await User.findOne({ email });

        if (!user) {
            const isSuperAdmin = email === SUPER_ADMIN_EMAIL.toLowerCase();
            const randomPassword = crypto.randomBytes(32).toString('hex');

            user = await User.create({
                firstName,
                lastName,
                email,
                password: randomPassword,
                isSuperAdmin,
                googleId,
            });
        } else {
            const shouldBeSuperAdmin = user.isSuperAdmin === true || email === SUPER_ADMIN_EMAIL.toLowerCase();
            let shouldSave = false;

            if (user.isSuperAdmin !== shouldBeSuperAdmin) {
                user.isSuperAdmin = shouldBeSuperAdmin;
                shouldSave = true;
            }

            if (!user.googleId && googleId) {
                user.googleId = googleId;
                shouldSave = true;
            }

            if (!user.firstName && firstName) {
                user.firstName = firstName;
                shouldSave = true;
            }

            if (!user.lastName && lastName) {
                user.lastName = lastName;
                shouldSave = true;
            }

            if (shouldSave) {
                await user.save();
            }
        }

        res.json(getUserResponse(user));
    } catch (error) {
        console.error('[GOOGLE AUTH ERROR]:', error);
        res.status(401).json({ message: 'Google authentication failed.' });
    }
};

export default {
    registerUser,
    authUser,
    getUserByEmail, 
    getUserProfile,
    updateUserProfile, // <--- Preserved and updated
    uploadProfilePic,   // <--- New file upload endpoint
    deleteUserAccount,  // <--- Account deletion
    forgotPassword,     // <--- Password reset request
    resetPassword,      // <--- Password reset with token
    googleAuth,         // <--- Google OAuth
};