import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const ChannelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    department: { type: String, default: '' },
    group: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', default: null },
    type: { type: String, enum: ['public', 'private'], default: 'public' },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    messages: { type: [MessageSchema], default: [] },
    joinRequests: [{
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      requestedAt: { type: Date, default: Date.now }
    }],
  },
  { timestamps: true }
);

const Channel = mongoose.model('Channel', ChannelSchema);
export default Channel;
