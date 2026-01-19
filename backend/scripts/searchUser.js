import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const searchUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Searching for admin@example.com...\n');
    const admin = await User.findOne({ email: 'admin@example.com' });
    
    if (admin) {
      console.log('✅ Found Account:');
      console.log('  Name:', admin.firstName, admin.lastName);
      console.log('  Email:', admin.email);
      console.log('  Created At:', admin.createdAt);
      console.log('  Super Admin:', admin.isSuperAdmin);
      console.log('  ID:', admin._id);
    } else {
      console.log('❌ No account found with email: admin@example.com');
    }
    
    console.log('\n=== ALL USERS IN DATABASE ===\n');
    const allUsers = await User.find().select('firstName lastName email createdAt isSuperAdmin').sort({ createdAt: -1 });
    
    allUsers.forEach((u, index) => {
      console.log(`${index + 1}. ${u.email}`);
      console.log(`   Name: ${u.firstName} ${u.lastName}`);
      console.log(`   Super Admin: ${u.isSuperAdmin}`);
      console.log(`   Created: ${u.createdAt}`);
      console.log('');
    });
    
    console.log(`Total users: ${allUsers.length}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

searchUser();
