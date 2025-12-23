import mongoose from 'mongoose';

const InvitationSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    inviter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true },
    role: { type: String, enum: ['manager', 'employee'], required: true },
    department: { type: String, default: '' },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'accepted', 'revoked', 'expired'], default: 'pending' },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Invitation = mongoose.model('Invitation', InvitationSchema);
export default Invitation;
