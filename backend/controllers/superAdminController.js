import SuperAdmin from '../models/SuperAdmin.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Task from '../models/Task.js';
import Team from '../models/Team.js';
import Department from '../models/Department.js';
import Announcement from '../models/Announcement.js';
import Notification from '../models/Notification.js';

// Fixed super admin email - only this account has super admin access
const SUPER_ADMIN_EMAIL = 'admin.workpro@gmail.com';

// Check if user is super admin
export const isSuperAdmin = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return false;

  // A user is super admin if explicitly flagged OR matches the fixed email
  const isAdminEmail = user.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
  const effective = user.isSuperAdmin === true || isAdminEmail;

  // Keep DB flag in sync so subsequent checks are fast
  if (user.isSuperAdmin !== effective) {
    user.isSuperAdmin = effective;
    await user.save();
  }

  return effective;
};

// Get super admin dashboard analytics
export const getSuperAdminAnalytics = async (req, res) => {
  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can access this' });
    }

    const [totalCompanies, totalUsers, totalTasks, totalTeams, totalDepartments, totalAnnouncements] = await Promise.all([
      Company.countDocuments(),
      User.countDocuments(),
      Task.countDocuments(),
      Team.countDocuments(),
      Department.countDocuments(),
      Announcement.countDocuments(),
    ]);

    // Task statistics
    const taskStats = await Task.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const taskByStatus = taskStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // Priority statistics
    const priorityStats = await Task.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    const taskByPriority = priorityStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    // User roles breakdown
    const userRoleStats = await Company.aggregate([
      { $unwind: '$members' },
      {
        $group: {
          _id: '$members.role',
          count: { $sum: 1 },
        },
      },
    ]);

    const userByRole = userRoleStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {});

    res.json({
      overview: {
        totalCompanies,
        totalUsers,
        totalTasks,
        totalTeams,
        totalDepartments,
        totalAnnouncements,
      },
      analytics: {
        tasksByStatus: taskByStatus,
        tasksByPriority: taskByPriority,
        usersByRole: userByRole,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get all companies analytics
export const getAllCompaniesAnalytics = async (req, res) => {
  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can access this' });
    }

    const companies = await Company.find()
      .populate('owner', 'firstName lastName email')
      .select('name owner members createdAt');

    const companiesAnalytics = await Promise.all(
      companies.map(async (company) => {
        const taskCount = await Task.countDocuments({ company: company._id });
        const teamCount = await Team.countDocuments({ company: company._id });
        const departmentCount = await Department.countDocuments({ company: company._id });

        return {
          _id: company._id,
          name: company.name,
          owner: company.owner,
          memberCount: company.members.length,
          taskCount,
          teamCount,
          departmentCount,
          createdAt: company.createdAt,
        };
      })
    );

    res.json(companiesAnalytics);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get task counts for a specific company
export const getCompanyTaskAnalytics = async (req, res) => {
  const { companyId } = req.params;

  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can access this' });
    }

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const tasks = await Task.find({ company: companyId });

    const analytics = {
      companyName: company.name,
      totalTasks: tasks.length,
      byStatus: tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {}),
      byPriority: tasks.reduce((acc, t) => {
        acc[t.priority] = (acc[t.priority] || 0) + 1;
        return acc;
      }, {}),
      overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length,
      completed: tasks.filter(t => t.status === 'done').length,
    };

    res.json(analytics);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Manage pricing plans
export const updatePricingPlans = async (req, res) => {
  const { plans } = req.body;

  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can access this' });
    }

    let superAdminRecord = await SuperAdmin.findOne({ user: req.user._id });
    if (!superAdminRecord) {
      superAdminRecord = new SuperAdmin({ user: req.user._id });
    }

    superAdminRecord.pricingPlans = plans;
    await superAdminRecord.save();

    res.json({ message: 'Pricing plans updated', plans });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get pricing plans
export const getPricingPlans = async (req, res) => {
  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can access this' });
    }

    let superAdminRecord = await SuperAdmin.findOne({ user: req.user._id });
    if (!superAdminRecord) {
      superAdminRecord = new SuperAdmin({ user: req.user._id, pricingPlans: [] });
      await superAdminRecord.save();
    }

    res.json(superAdminRecord.pricingPlans);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get public pricing plans (no auth required)
export const getPublicPricingPlans = async (req, res) => {
  try {
    // Get the first super admin's pricing plans
    const superAdminRecord = await SuperAdmin.findOne().select('pricingPlans');
    if (!superAdminRecord || !superAdminRecord.pricingPlans.length) {
      // Return default pricing plans if none exist
      return res.json([
        {
          name: 'Free',
          price: 0,
          features: ['Up to 5 team members', 'Basic task management', 'Community support']
        },
        {
          name: 'Pro',
          price: 29,
          features: ['Up to 50 team members', 'Advanced analytics', 'Priority support', 'Custom integrations']
        },
        {
          name: 'Enterprise',
          price: 99,
          features: ['Unlimited team members', 'Advanced security', 'Dedicated support', 'Advanced reporting', 'API access']
        }
      ]);
    }

    res.json(superAdminRecord.pricingPlans);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get public platform stats (no auth required)
export const getPublicStats = async (req, res) => {
  try {
    const [totalCompanies, totalUsers, totalTasks, completedTasks] = await Promise.all([
      Company.countDocuments(),
      User.countDocuments(),
      Task.countDocuments(),
      Task.countDocuments({ status: 'done' }),
    ]);

    res.json({
      companies: totalCompanies,
      users: totalUsers,
      tasksCompleted: completedTasks,
      uptime: '99.9%'
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Log activity for monetization tracking
export const logActivity = async (req, res) => {
  const { action, companyId, details } = req.body;

  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can access this' });
    }

    let superAdminRecord = await SuperAdmin.findOne({ user: req.user._id });
    if (!superAdminRecord) {
      superAdminRecord = new SuperAdmin({ user: req.user._id });
    }

    superAdminRecord.activityLog.push({
      action,
      company: companyId,
      details,
      timestamp: new Date(),
    });

    await superAdminRecord.save();
    res.json({ message: 'Activity logged' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get activity log
export const getActivityLog = async (req, res) => {
  const { limit = 50, skip = 0 } = req.query;

  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can access this' });
    }

    const superAdminRecord = await SuperAdmin.findOne({ user: req.user._id })
      .populate('activityLog.company', 'name');

    if (!superAdminRecord) {
      return res.json([]);
    }

    const log = superAdminRecord.activityLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(skip, skip + limit);

    res.json(log);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get user analytics
export const getUserAnalytics = async (req, res) => {
  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can access this' });
    }

    const totalUsers = await User.countDocuments();
    const superAdmins = await User.countDocuments({ isSuperAdmin: true });
    const usersWithCompanies = await User.countDocuments({ companies: { $exists: true, $ne: [] } });

    const companyMemberships = await Company.aggregate([
      { $unwind: '$members' },
      {
        $group: {
          _id: null,
          avgMembers: { $avg: { $size: '$members' } },
          maxMembers: { $max: { $size: '$members' } },
          minMembers: { $min: { $size: '$members' } },
        },
      },
    ]);

    res.json({
      totalUsers,
      superAdmins,
      usersWithCompanies,
      companyMemberships: companyMemberships[0] || {},
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update platform content settings
export const updatePlatformContent = async (req, res) => {
  const { hero, features, stats } = req.body;

  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can access this' });
    }

    let superAdminRecord = await SuperAdmin.findOne({ user: req.user._id });
    if (!superAdminRecord) {
      superAdminRecord = new SuperAdmin({ user: req.user._id });
    }

    if (hero) superAdminRecord.platformContent.hero = hero;
    if (features) superAdminRecord.platformContent.features = features;
    if (stats) superAdminRecord.platformContent.stats = stats;

    await superAdminRecord.save();

    res.json({ message: 'Platform content updated', platformContent: superAdminRecord.platformContent });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get platform content settings
export const getPlatformContent = async (req, res) => {
  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can access this' });
    }

    let superAdminRecord = await SuperAdmin.findOne({ user: req.user._id });
    if (!superAdminRecord) {
      superAdminRecord = new SuperAdmin({ user: req.user._id });
      await superAdminRecord.save();
    }

    res.json(superAdminRecord.platformContent || {});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get public platform content (no auth required)
export const getPublicPlatformContent = async (req, res) => {
  try {
    const superAdminRecord = await SuperAdmin.findOne().select('platformContent');
    
    if (!superAdminRecord || !superAdminRecord.platformContent) {
      // Return default content
      return res.json({
        hero: {
          badge: 'Trusted by Companies',
          headline: 'Everything you need to scale your company.',
          subheadline: 'WorkPro is the unified operating system for your team. Track tasks, manage people, and drive growth from one intuitive platform.',
        },
        features: [
          { title: 'Task Boards', description: 'Organize work visually with drag-and-drop Kanban boards that keep everyone in sync.', icon: 'IoLayersOutline' },
          { title: 'Instant Sync', description: 'Real-time updates mean your team is always working on the most current version.', icon: 'IoFlashOutline' },
          { title: 'Team Hub', description: 'Centralize communications and documents in a unified workspace for your whole company.', icon: 'IoPeopleCircleOutline' },
          { title: 'Analytics', description: 'Get deep insights into team productivity and project progress with automated reports.', icon: 'IoStatsChartOutline' }
        ],
        stats: {
          uptime: '99.9%',
          uptimeLabel: 'System Uptime',
          companiesLabel: 'Global Companies',
          usersLabel: 'Active Users',
          tasksLabel: 'Tasks Completed',
        },
      });
    }

    res.json(superAdminRecord.platformContent);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Create maintenance message / notification
export const createNotification = async (req, res) => {
  const { type = 'maintenance', title, message, severity = 'medium', targetUsers = [], targetCompanies = [], endDate, actionUrl, actionLabel } = req.body;

  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can create notifications' });
    }

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const notification = await Notification.create({
      type,
      title,
      message,
      severity,
      targetUsers: targetUsers.length > 0 ? targetUsers : [], // Empty = all users
      targetCompanies: targetCompanies.length > 0 ? targetCompanies : [],
      endDate: endDate || null,
      actionUrl: actionUrl || null,
      actionLabel: actionLabel || null,
      isActive: true,
      createdBy: req.user._id,
    });

    res.status(201).json({ message: 'Notification created', notification });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get all notifications (for admin)
export const getAllNotifications = async (req, res) => {
  const { isActive, type, limit = 50, skip = 0 } = req.query;

  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can view all notifications' });
    }

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (type) filter.type = type;

    const notifications = await Notification.find(filter)
      .populate('createdBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Notification.countDocuments(filter);

    res.json({ notifications, total, skip: parseInt(skip), limit: parseInt(limit) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get active notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const currentDate = new Date();

    // Get notifications that are:
    // 1. Active
    // 2. Not expired (no endDate or endDate is in future)
    // 3. For all users OR specifically targets this user
    // 4. For all companies OR specifically targets user's companies
    const userCompanies = await Company.find({ 'members.user': req.user._id }).select('_id');
    const companyIds = userCompanies.map(c => c._id);

    const notifications = await Notification.find({
      isActive: true,
      startDate: { $lte: currentDate },
      $or: [
        { endDate: null },
        { endDate: { $gte: currentDate } }
      ],
      $or: [
        { targetUsers: { $size: 0 } },
        { targetUsers: req.user._id }
      ],
      $or: [
        { targetCompanies: { $size: 0 } },
        { targetCompanies: { $in: companyIds } }
      ]
    })
      .populate('createdBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    // Get read status for this user
    const notificationsWithReadStatus = notifications.map(notif => {
      const isRead = notif.readBy.some(r => r.user.toString() === req.user._id.toString());
      return {
        ...notif.toObject(),
        isRead
      };
    });

    res.json(notificationsWithReadStatus);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  const { notificationId } = req.params;

  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Check if already read
    const isAlreadyRead = notification.readBy.some(r => r.user.toString() === req.user._id.toString());
    if (!isAlreadyRead) {
      notification.readBy.push({ user: req.user._id, readAt: new Date() });
      await notification.save();
    }

    res.json({ message: 'Notification marked as read' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Update notification
export const updateNotification = async (req, res) => {
  const { notificationId } = req.params;
  const { title, message, severity, endDate, isActive, actionUrl, actionLabel } = req.body;

  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can update notifications' });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (title) notification.title = title;
    if (message) notification.message = message;
    if (severity) notification.severity = severity;
    if (endDate !== undefined) notification.endDate = endDate || null;
    if (isActive !== undefined) notification.isActive = isActive;
    if (actionUrl !== undefined) notification.actionUrl = actionUrl || null;
    if (actionLabel !== undefined) notification.actionLabel = actionLabel || null;

    await notification.save();
    res.json({ message: 'Notification updated', notification });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Delete notification
export const deleteNotification = async (req, res) => {
  const { notificationId } = req.params;

  try {
    if (!await isSuperAdmin(req.user._id)) {
      return res.status(403).json({ message: 'Only super admins can delete notifications' });
    }

    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
