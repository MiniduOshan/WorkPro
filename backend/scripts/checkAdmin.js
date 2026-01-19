import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const checkAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB\n');

    const admin = await User.findOne({ email: 'admin.workpro@gmail.com' });
    
    if (admin) {
      console.log('✅ Admin account found:');
      console.log('   Name:', admin.firstName, admin.lastName);
      console.log('   Email:', admin.email);
      console.log('   isSuperAdmin:', admin.isSuperAdmin);
      console.log('   ID:', admin._id);
    } else {
      console.log('❌ Admin account NOT found');
      console.log('\n📝 To create the admin account:');
      console.log('   1. Go to the signup page');
      console.log('   2. Sign up with email: admin.workpro@gmail.com');
      console.log('   3. Use any password and name');
      console.log('   4. The system will automatically set it as super admin\n');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error.message);
  }
};

checkAdmin();
