import Task from '../models/Task.js';
import Company from '../models/Company.js';
import Team from '../models/Team.js';
import Department from '../models/Department.js';
import Announcement from '../models/Announcement.js';
import User from '../models/User.js';

const ensureMember = async (companyId, userId) => {
  if (!companyId) return { error: 'Company ID is required' };
  const company = await Company.findById(companyId);
  if (!company) return { error: 'Company not found' };
  const role = company.getMemberRole(userId);
  if (!role) return { error: 'Not a member of this company' };
  return { company, role };
};

export const managerSummary = async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { company, role, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) return res.status(403).json({ message: 'Only managers can view manager dashboard' });

    const [tasksByStatus, teams, departments, membersCount] = await Promise.all([
      Task.aggregate([
        { $match: { company: company._id } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Team.find({ company: company._id }).select('name members').lean(),
      Department.find({ company: company._id }).select('name managers').lean(),
      Promise.resolve(company.members.length)
    ]);

    const statusMap = tasksByStatus.reduce((acc, x) => { acc[x._id] = x.count; return acc; }, {});
    res.json({
      tasks: {
        total: (statusMap['to-do']||0)+(statusMap['in-progress']||0)+(statusMap['blocked']||0)+(statusMap['done']||0),
        byStatus: statusMap,
      },
      teams: teams.map(t => ({ _id: t._id, name: t.name, members: t.members.length })),
      departments: departments.map(d => ({ _id: d._id, name: d.name, managers: d.managers.length })),
      members: membersCount,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const userSummary = async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { company, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    const myTasks = await Task.find({ company: company._id, assignee: req.user._id }).sort({ dueDate: 1 }).limit(50);
    const counts = myTasks.reduce((acc, t) => { acc[t.status] = (acc[t.status]||0)+1; return acc; }, {});
    res.json({
      tasks: {
        total: myTasks.length,
        byStatus: counts,
        upcoming: myTasks.filter(t => t.dueDate && t.status !== 'done').slice(0, 10),
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get task analytics for dashboard
export const getTaskAnalytics = async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { company, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });

    const tasks = await Task.find({ company: company._id });
    
    // Calculate analytics
    const byStatus = {};
    const byPriority = {};
    const byAssignee = {};
    let overdue = 0;

    tasks.forEach(task => {
      // By status
      byStatus[task.status] = (byStatus[task.status] || 0) + 1;
      
      // By priority
      byPriority[task.priority] = (byPriority[task.priority] || 0) + 1;
      
      // By assignee
      if (task.assignee) {
        const assigneeId = task.assignee.toString();
        byAssignee[assigneeId] = (byAssignee[assigneeId] || 0) + 1;
      }

      // Overdue count
      if (task.dueDate && task.dueDate < new Date() && task.status !== 'done') {
        overdue += 1;
      }
    });

    res.json({
      total: tasks.length,
      byStatus,
      byPriority,
      byAssignee,
      overdue,
      completed: byStatus['done'] || 0,
      inProgress: byStatus['in-progress'] || 0,
      todo: byStatus['to-do'] || 0,
      blocked: byStatus['blocked'] || 0,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get full manager dashboard data
export const getManagerDashboard = async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { company, role, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });
    if (!['owner', 'manager'].includes(role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    const [tasks, announcements, teams, departments, members] = await Promise.all([
      Task.find({ company: company._id })
        .populate('assignee', 'firstName lastName')
        .populate('team', 'name')
        .sort({ dueDate: 1 }),
      Announcement.find({ company: company._id })
        .populate('createdBy', 'firstName lastName')
        .sort({ pinned: -1, createdAt: -1 })
        .limit(5),
      Team.find({ company: company._id }).populate('members', 'firstName lastName'),
      Department.find({ company: company._id }).populate('managers', 'firstName lastName'),
      company.members,
    ]);

    // Calculate task analytics
    const taskStats = {
      total: tasks.length,
      byStatus: tasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {}),
      byPriority: tasks.reduce((acc, t) => {
        acc[t.priority] = (acc[t.priority] || 0) + 1;
        return acc;
      }, {}),
      overdue: tasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length,
    };

    res.json({
      taskStats,
      recentAnnouncements: announcements,
      teams: teams.map(t => ({ _id: t._id, name: t.name, memberCount: t.members.length })),
      departments: departments.map(d => ({ _id: d._id, name: d.name, managerCount: d.managers.length })),
      memberCount: members.length,
      upcomingTasks: tasks.filter(t => t.dueDate && t.status !== 'done').slice(0, 10),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

// Get full employee dashboard data
export const getEmployeeDashboard = async (req, res) => {
  const { companyId } = req.query;
  if (!companyId) return res.status(400).json({ message: 'companyId required' });
  try {
    const { company, error } = await ensureMember(companyId, req.user._id);
    if (error) return res.status(403).json({ message: error });

    const [myTasks, announcements, teams, userTeams] = await Promise.all([
      Task.find({ company: company._id, assignee: req.user._id })
        .populate('team', 'name')
        .sort({ dueDate: 1 }),
      Announcement.find({ 
        company: company._id,
        $or: [
          { audience: 'all' },
          { audience: 'employees' }
        ]
      })
        .populate('createdBy', 'firstName lastName')
        .sort({ pinned: -1, createdAt: -1 })
        .limit(10),
      Team.find({ company: company._id, members: req.user._id }).populate('members', 'firstName lastName'),
      Team.find({ company: company._id, members: req.user._id }),
    ]);

    // Calculate task stats
    const taskStats = {
      total: myTasks.length,
      byStatus: myTasks.reduce((acc, t) => {
        acc[t.status] = (acc[t.status] || 0) + 1;
        return acc;
      }, {}),
      overdue: myTasks.filter(t => t.dueDate && t.dueDate < new Date() && t.status !== 'done').length,
    };

    res.json({
      taskStats,
      myTasks: myTasks.slice(0, 10),
      announcements,
      myTeams: teams.map(t => ({ _id: t._id, name: t.name, members: t.members })),
      upcomingDeadlines: myTasks.filter(t => t.dueDate && t.status !== 'done').slice(0, 5),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
