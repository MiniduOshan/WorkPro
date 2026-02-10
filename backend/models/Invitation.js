import mongoose from 'mongoose';

const InvitationSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    inviter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, default: '' },
    role: { type: String, enum: ['manager', 'employee'], required: true },
    department: { type: String, default: '' },
    token: { type: String, required: true, unique: true }, // Unique invitation token for URL
    invitationLink: { type: String }, // Full invitation URL, auto-generated
    status: { type: String, enum: ['pending', 'accepted', 'revoked', 'expired'], default: 'pending' },
    maxUses: { type: Number, default: 50 },
    usesCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    acceptedAt: { type: Date },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User who accepted the invitation
  },
  { timestamps: true }
);

InvitationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
InvitationSchema.index({ email: 1, company: 1 });

const Invitation = mongoose.model('Invitation', InvitationSchema);
export default Invitation;
