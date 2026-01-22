import mongoose from 'mongoose';

const MemberSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['owner', 'manager', 'employee'], required: true },
    department: { type: String, default: '' },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CompanySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    description: { type: String, default: '' },
    website: { type: String, default: '' },
    mission: { type: String, default: '' },
    vision: { type: String, default: '' },
    industry: { type: String, default: '' },
    departments: { type: [String], default: [] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: { type: [MemberSchema], default: [] },
  },
  { timestamps: true }
);

CompanySchema.methods.getMemberRole = function (userId) {
  if (!userId) return null;
  
  // Check if user is the owner (handle both populated and unpopulated owner field)
  const ownerId = this.owner?._id ? this.owner._id.toString() : this.owner?.toString();
  const userIdStr = userId.toString();
  
  if (ownerId === userIdStr) {
    return 'owner';
  }
  
  // Check if user is in members array
  const member = this.members.find((m) => {
    const memberId = m.user?._id ? m.user._id.toString() : m.user?.toString();
    return memberId === userIdStr;
  });
  
  return member ? member.role : null;
};

const Company = mongoose.model('Company', CompanySchema);
export default Company;
