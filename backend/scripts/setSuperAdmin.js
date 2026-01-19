// backend/scripts/setSuperAdmin.js
// ⚠️ DEPRECATED - Super Admin is now hardcoded to admin.workpro@gmail.com
// This script is kept for reference only
// 
// The super admin account is now fixed to: admin.workpro@gmail.com
// Only this email can have super admin access
// No other accounts can be made super admin through the website

import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const SUPER_ADMIN_EMAIL = 'admin.workpro@gmail.com';

const setSuperAdmin = async (email) => {
  try {
    console.log('\n⚠️  WARNING: Super Admin is now hardcoded!\n');
    console.log(`Only ${SUPER_ADMIN_EMAIL} can be a super admin.`);
    console.log('This is a fixed account and cannot be changed.\n');

    if (email.toLowerCase() !== SUPER_ADMIN_EMAIL.toLowerCase()) {
      console.error(`❌ Cannot set "${email}" as super admin.`);
      console.log(`\nOnly ${SUPER_ADMIN_EMAIL} is allowed to be super admin.`);
      console.log('Please sign up with this email to create the admin account.\n');
      process.exit(1);
    }

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      console.log('\n📝 Please sign up first with admin.workpro@gmail.com');
      console.log('The system will automatically set it as super admin.\n');
      process.exit(1);
    }

    // Set as super admin
    user.isSuperAdmin = true;
    await user.save();

    console.log(`✅ Successfully confirmed "${email}" as super admin!`);
    console.log(`User: ${user.firstName} ${user.lastName}`);
    console.log(`ID: ${user._id}`);
    console.log(`\nYou can now login and access the super admin dashboard.\n`);

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
  console.error('\n⚠️  Super Admin Account Information\n');
  console.log(`The super admin account is fixed to: ${SUPER_ADMIN_EMAIL}`);
  console.log('No other accounts can be made super admin.\n');
  console.log('To create the admin account:');
  console.log('1. Sign up at the website with admin.workpro@gmail.com');
  console.log('2. The system will automatically grant super admin access\n');
  process.exit(1);
}

setSuperAdmin(email);
