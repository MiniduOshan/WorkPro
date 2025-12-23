import User from '../models/User.js';
import generateToken from '../config/generateToken.js';

// Helper function to structure user response (used for both signup and login success)
const getUserResponse = (user) => ({
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    username: `${user.firstName} ${user.lastName}`, // The combined name
    email: user.email,
    token: generateToken(user._id),
});

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

        const user = await User.create({ firstName, lastName, email, password });

        if (user) {
            console.log(`[AUTH] User created successfully: ${user.email}`);
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

export default {
    registerUser,
    authUser,
    getUserByEmail, 
    getUserProfile,
    updateUserProfile, // <--- Preserved and updated
    uploadProfilePic,   // <--- New file upload endpoint
};