import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['general', 'contract', 'report', 'presentation', 'spreadsheet', 'image', 'other'],
      default: 'general',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    linkedTo: {
      type: {
        type: String,
        enum: ['task', 'channel', 'none'],
        default: 'none',
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    tags: [String],
    isArchived: {
      type: Boolean,
      default: false,
    },
    accessCount: {
      type: Number,
      default: 0,
    },
    lastAccessed: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Text search index
DocumentSchema.index({ name: 'text', originalName: 'text', tags: 'text' });
DocumentSchema.index({ company: 1, isArchived: 1, createdAt: -1 });

const Document = mongoose.model('Document', DocumentSchema);
export default Document;
