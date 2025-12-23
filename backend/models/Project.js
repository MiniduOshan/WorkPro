import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    department: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['planned', 'active', 'on-hold', 'completed'], default: 'planned' },
  },
  { timestamps: true }
);

const Project = mongoose.model('Project', ProjectSchema);
export default Project;
