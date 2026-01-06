import SuperAdmin from '../models/SuperAdmin.js';
import User from '../models/User.js';
import Company from '../models/Company.js';
import Task from '../models/Task.js';
import Team from '../models/Team.js';
import Department from '../models/Department.js';
import Announcement from '../models/Announcement.js';

// Check if user is super admin
const isSuperAdmin = async (userId) => {
  const user = await User.findById(userId);
  return user && user.isSuperAdmin;
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
