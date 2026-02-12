import mongoose from 'mongoose';

const SuperAdminSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    totalCompanies: { type: Number, default: 0 },
    totalUsers: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    totalTeams: { type: Number, default: 0 },
    totalDepartments: { type: Number, default: 0 },
    totalAnnouncements: { type: Number, default: 0 },
    
    // Analytics breakdown
    analyticsData: {
      tasksByStatus: {
        todo: { type: Number, default: 0 },
        inProgress: { type: Number, default: 0 },
        blocked: { type: Number, default: 0 },
        done: { type: Number, default: 0 },
      },
      tasksByPriority: {
        low: { type: Number, default: 0 },
        medium: { type: Number, default: 0 },
        high: { type: Number, default: 0 },
        urgent: { type: Number, default: 0 },
      },
      usersByRole: {
        owner: { type: Number, default: 0 },
        manager: { type: Number, default: 0 },
        employee: { type: Number, default: 0 },
      },
    },
    
    // Pricing and monetization
    pricingPlans: [
      {
        name: { type: String }, // e.g., "Free", "Pro", "Enterprise"
        price: { type: Number },
        features: [String],
        activeCompanies: { type: Number, default: 0 },
      },
    ],
    
    // Platform content settings for landing page
    platformContent: {
      siteName: { type: String, default: 'WorkPro' },
      hero: {
        badge: { type: String, default: 'Trusted by Companies' },
        headline: { type: String, default: 'Everything you need to scale your company.' },
        subheadline: { type: String, default: 'WorkPro is the unified operating system for your team. Track tasks, manage people, and drive growth from one intuitive platform.' },
      },
      features: [
        {
          title: { type: String },
          description: { type: String },
          icon: { type: String }, // icon name from react-icons
        },
      ],
      stats: {
        uptime: { type: String, default: '99.9%' },
        uptimeLabel: { type: String, default: 'System Uptime' },
        companiesValue: { type: String, default: '' },
        companiesLabel: { type: String, default: 'Global Companies' },
        usersValue: { type: String, default: '' },
        usersLabel: { type: String, default: 'Active Users' },
        tasksValue: { type: String, default: '' },
        tasksLabel: { type: String, default: 'Tasks Completed' },
      },
    },
    
    // Activity tracking for future monetization
    activityLog: [
      {
        action: { type: String }, // e.g., "plan_change", "task_created", "user_joined"
        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
        details: mongoose.Schema.Types.Mixed,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Update timestamp before saving
SuperAdminSchema.pre('save', function () {
  this.lastUpdated = Date.now();
});

const SuperAdmin = mongoose.model('SuperAdmin', SuperAdminSchema);
export default SuperAdmin;
