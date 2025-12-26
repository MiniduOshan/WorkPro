import mongoose from 'mongoose';

const GroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

GroupSchema.index({ company: 1, name: 1 }, { unique: true });

const Group = mongoose.model('Group', GroupSchema);
export default Group;
