import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
    status: { type: String, enum: ['to-do', 'in-progress', 'blocked', 'done'], default: 'to-do' },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    dueDate: { type: Date },
    category: { type: String, default: '' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    checklist: [
      {
        title: { type: String, required: true },
        done: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', TaskSchema);
export default Task;
