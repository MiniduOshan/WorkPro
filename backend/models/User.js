import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, match: [/.+@.+\..+/, 'Must match an email address!'] },
    password: { type: String, required: true, minlength: 6 },
    mobileNumber: { type: String, default: '' },
    profilePic: { type: String, default: '/images/default_avatar.png' },
    location: { type: String, default: '' },
    googleId: { type: String, default: '' },
    companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }], // Array of company IDs user belongs to
    defaultCompany: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }, // Last selected or default company
    isSuperAdmin: { type: Boolean, default: false }, // For super admin access to analytics
    resetPasswordToken: { type: String }, // Hashed token for password reset
    resetPasswordExpire: { type: Date }, // Expiration time for reset token
  },
  { timestamps: true }
);

// Compare entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Hash password before saving
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', UserSchema);

export default User;
