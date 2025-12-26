import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

TeamSchema.index({ company: 1, name: 1 }, { unique: true });

const Team = mongoose.model('Team', TeamSchema);
export default Team;
