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
  const m = this.members.find((x) => x.user?.toString() === userId?.toString());
  return m ? m.role : null;
};

const Company = mongoose.model('Company', CompanySchema);
export default Company;
