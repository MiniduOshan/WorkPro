import mongoose from 'mongoose';

const AnnouncementSchema = new mongoose.Schema(
  {
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
    audience: { type: String, enum: ['all', 'managers', 'employees'], default: 'all' },
    priority: { type: String, enum: ['high', 'normal', 'low'], default: 'normal' },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

AnnouncementSchema.index({ company: 1, createdAt: -1 });

const Announcement = mongoose.model('Announcement', AnnouncementSchema);
export default Announcement;
