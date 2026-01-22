import User from '../models/User.js';
import generateToken from '../config/generateToken.js';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../config/email.js';

// Fixed super admin email - cannot be changed through website
const SUPER_ADMIN_EMAIL = 'admin.workpro@gmail.com';

// Helper function to structure user response (used for both signup and login success)
const getUserResponse = (user) => {
    // A user is super admin if they are flagged OR they match the fixed email
    const isSuperAdmin = user.isSuperAdmin === true || user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
    
    console.log(`[AUTH] Processing user: ${user.email}`);
    console.log(`[AUTH] Is SuperAdmin: ${isSuperAdmin} (checking against: ${SUPER_ADMIN_EMAIL})`);
    
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

    console.log(`[AUTH] Attempting signup for email: ${email}`);
    console.log("Received Body:", req.body);

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
            console.log(`[AUTH] User created successfully: ${user.email}${isSuperAdmin ? ' (Super Admin)' : ''}`);
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

        // Remove user from all companies
        const Company = req.app.locals.Company || (await import('../models/Company.js')).default;
        await Company.updateMany(
            { 'members.user': user._id },
            { $pull: { members: { user: user._id } } }
        );

        // Delete the user
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

    try {
        const user = await User.findOne({ email });

        if (!user) {
            // Don't reveal if user exists or not for security
            return res.json({ message: 'If an account exists, a password reset link will be sent.' });
        }

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

        try {
            await sendPasswordResetEmail({
                to: user.email,
                resetLink: resetUrl,
                firstName: user.firstName
            });

            res.json({ message: 'Password reset email sent successfully' });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save();
            
            return res.status(500).json({ 
                message: 'Email could not be sent. Please try again later.' 
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

// @desc    Google OAuth callback
// @route   GET /api/users/auth/google
// @access  Public
const googleAuth = async (req, res) => {
    // This will be implemented with Google OAuth strategy
    res.status(501).json({ message: 'Google authentication not yet implemented' });
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