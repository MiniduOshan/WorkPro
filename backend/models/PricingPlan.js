import mongoose from 'mongoose';

const PricingPlanSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        price: { type: Number, required: true, default: 0 },
        currency: { type: String, default: 'USD' },
        billingCycle: { type: String, enum: ['monthly', 'yearly'], default: 'monthly' },
        description: { type: String, default: '' },
        features: {
            support: { type: Boolean, default: false }, // Email/Chat support
            emailNotifications: { type: Boolean, default: true },
            fileUpload: { type: Boolean, default: true },
            analytics: { type: Boolean, default: false },
            aiInsights: { type: Boolean, default: false },
            monthlyReports: { type: Boolean, default: false },
        },
        limits: {
            maxUsers: { type: Number, default: 2 }, // -1 for unlimited
            maxStorageStr: { type: String, default: '200MB' }, // Store as string (e.g., '200MB', '1GB') for display
            maxStorageBytes: { type: Number, default: 209715200 }, // 200MB in bytes for enforcement
            maxProjects: { type: Number, default: 3 }, // Fallback for old data
            maxProjectGroups: { type: Number, default: 3 },
            maxDepartments: { type: Number, default: 2 },
            maxChannels: { type: Number, default: 5 },
            maxAnnouncements: { type: Number, default: 10 },
            maxTasks: { type: Number, default: 50 },
        },
        isPublic: { type: Boolean, default: true }, // Show on landing page
        isDefault: { type: Boolean, default: false }, // Assign to new companies
        paypalPlanId: { type: String, default: '' }, // PayPal Gateway ID for this plan
    },
    { timestamps: true }
);

const PricingPlan = mongoose.model('PricingPlan', PricingPlanSchema);
export default PricingPlan;
