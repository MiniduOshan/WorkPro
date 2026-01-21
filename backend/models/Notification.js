import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['maintenance', 'alert', 'info', 'warning'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    icon: { type: String, default: 'IoNotificationsOutline' }, // React icon name
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
    
    // Target audience
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Empty = all users
    targetCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }], // Empty = all companies
    
    // Read status per user
    readBy: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    
    // Display settings
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }, // null = no expiration
    
    // Action URL (optional)
    actionUrl: { type: String },
    actionLabel: { type: String },
    
    // Creator
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Index for efficient querying
NotificationSchema.index({ isActive: 1, startDate: 1, endDate: 1 });
NotificationSchema.index({ 'readBy.user': 1 });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
