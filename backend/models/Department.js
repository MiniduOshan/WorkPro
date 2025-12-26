import mongoose from 'mongoose';

const DepartmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    managers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

DepartmentSchema.index({ company: 1, name: 1 }, { unique: true });

const Department = mongoose.model('Department', DepartmentSchema);
export default Department;
