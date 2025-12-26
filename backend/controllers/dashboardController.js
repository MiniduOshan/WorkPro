import Task from '../models/Task.js';
import Company from '../models/Company.js';
import Team from '../models/Team.js';
import Department from '../models/Department.js';

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
