// backend/scripts/setSuperAdmin.js
// Run this script to make a user a super admin
// Usage: node scripts/setSuperAdmin.js <email>

import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const setSuperAdmin = async (email) => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    // Check if already super admin
    if (user.isSuperAdmin) {
      console.log(`✅ User "${email}" is already a super admin`);
      process.exit(0);
    }

    // Set as super admin
    user.isSuperAdmin = true;
    await user.save();

    console.log(`✅ Successfully set "${email}" as super admin!`);
    console.log(`User: ${user.firstName} ${user.lastName}`);
    console.log(`ID: ${user._id}`);
    console.log(`\nYou can now login and access: http://localhost:5173/dashboard/super-admin`);

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node scripts/setSuperAdmin.js <email>');
  process.exit(1);
}

setSuperAdmin(email);
